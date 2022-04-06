"""
This is a Python example on how to create a custom data enrichment component using Python and Flask.

For more information, see the Metamaze documentation or contact us at support@metamaze.eu.
"""

import logging
import os
import pickle
from functools import wraps
from typing import Any, Callable, Dict, List

import numpy as np
from flask import Flask, abort, jsonify, request
from flask_cors import CORS
from laserembeddings import Laser
from sklearn.ensemble import RandomForestClassifier

from config import BEARER_TOKEN

logging.basicConfig(
    level=logging.DEBUG, format="%(asctime)s %(levelname)-8s %(name)-10s %(message)s", datefmt="%Y-%m-%d %H:%M:%S",
)

PREDICTION_PATH = os.environ.get("PREDICTION_PATH", "/api/text-classification")
DYNAMIC_LIST_PATH = os.environ.get("DYNAMIC_LIST_PATH", "/api/list-classes")

logging.info(f"Entity names to be enriched: {os.environ['ENTITY_NAMES_TO_BE_ENRICHED'].split(', ')}")

app = Flask(__name__)

CORS(app, support_credentials=True)

PREDICTION_THRESHOLD = 0.35  # TODO fine-tune PREDICTION_THRESHOLD based on a final training


def load_classifier() -> RandomForestClassifier:
    with open("classifier.pkl", "rb") as f:
        classifier = pickle.load(f)
    return classifier


def create_app() -> Flask:

    app.classifier = load_classifier()
    app.embeddings_model = Laser()

    # classifier predicts based on the order of below classes
    app.ordered_classes = [
        "AG51",
        "AG14",
        "SC37",
        "RL27",
        "KM3",
        "AG48",
        "AG52",
        "RL4",
        "SP11",
        "KM61",
        "KM37",
        "HL38",
        "RL3",
        "AL4",
        "KM53",
    ]

    return app


def check_token(f: Callable) -> Callable:
    @wraps(f)
    def decorated(*args: Any, **kwargs: Any) -> Any:

        try:
            token_header = request.headers["authorization"]
        except KeyError:
            return abort(403, description="Authentication header missing.")

        auth_token = token_header.split(maxsplit=1)[1]
        if auth_token != BEARER_TOKEN:
            logging.error(f"Bad token '{auth_token}'")
            return abort(403, description="Incorrect or no authentication token.")

        return f(*args, **kwargs)

    return decorated


def predict_class_from_entity(entity: Dict[str, str], language: str) -> Dict[str, str]:
    enrichment = {}
    if entity["entityName"] in os.environ["ENTITY_NAMES_TO_BE_ENRICHED"].split(", "):
        embeddings = app.embeddings_model.embed_sentences(entity["text"], lang=language)
        pred_probs = app.classifier.predict_proba(embeddings)[0]

        enrichment_name = os.environ["ENRICHMENT_NAME"]
        pred_index = np.argmax(pred_probs)
        if pred_probs[pred_index] > PREDICTION_THRESHOLD:
            pred_class = app.ordered_classes[pred_index]
            enrichment = {"name": enrichment_name, "value": pred_class, "link": entity["link"]}

    return enrichment


@app.route(PREDICTION_PATH, methods=["POST"])
@check_token
def text_classification() -> Any:
    content = request.json
    logging.debug(f"Received request for document with id of {content.get('documentId')}")

    enrichments: List[Dict[str, str]] = []
    for entity in content["entities"]:
        enrichments.append(predict_class_from_entity(entity, content["language"]))
        for c_entity in entity.get("composites", []):
            enrichments.append(predict_class_from_entity(c_entity, content["language"]))

    # clean up empty enrichments due to low score
    enrichments = [enrichment for enrichment in enrichments if enrichment]

    logging.debug(f"Found enrichments: \n\n{enrichments}\n\n")
    return jsonify({"enrichments": enrichments})


@app.route(DYNAMIC_LIST_PATH, methods=["GET"])
@check_token
def list_classes() -> Any:
    return jsonify([{"value": c, "label": c} for c in app.ordered_classes])


@app.route("/", methods=["GET"])
def get_health() -> Any:
    return jsonify({"status": "ok"}), 200


if __name__ == "__main__":
    # do NOT run this in prod, flask dev server is not meant for that
    # check the dockerfile which starts a gunicorn server
    create_app().run(host="0.0.0.0", debug=True)
