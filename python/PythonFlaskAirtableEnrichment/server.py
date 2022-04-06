"""
This is a Python example on how to create a custom data enrichment component using Python and Flask.
Data is sourced from Airtable.

For more information, see the Metamaze documentation or contact us at support@metamaze.eu.
"""


import logging
from functools import wraps
from typing import Any, Callable, Dict, List

import requests
from flask import Flask, abort, jsonify, request
from flask_cors import CORS

from config import AIRTABLE_TOKEN, AIRTABLE_URL, BEARER_TOKEN

app = Flask(__name__)

CORS(app, support_credentials=True)


def create_app() -> Flask:

    app.name_to_gender_mapping = {
        record["name"].lower(): record["gender"] for record in get_airtable_data(AIRTABLE_URL, AIRTABLE_TOKEN)
    }
    app.possible_genders = {record["gender"] for record in get_airtable_data(AIRTABLE_URL, AIRTABLE_TOKEN)}

    return app


def get_airtable_data(url: str, token: str) -> List[Dict[str, str]]:
    """
    Fetch all data from airtable.

    Returns a list of records where record is an array like
        {'my-key': 'George W. Bush', 'my-value': 'Male'}
    """
    response = requests.request("GET", url, headers={"Authorization": f"Bearer {token}"})

    records = response.json()["records"]

    return [record["fields"] for record in records]


def check_token(f: Callable) -> Callable:
    @wraps(f)
    def decorated(*args: Any, **kwargs: Any) -> Any:
        print("headers: ", request.headers)
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


@app.route("/api/gender-lookup", methods=["POST"])
@check_token
def get_gender_from_name() -> Any:
    content = request.json

    enrichments = []

    for entity in content["entities"]:
        if entity["entityName"] == "Naam":
            try:
                gender = app.name_to_gender_mapping[entity["text"].lower()]
            except KeyError:
                logging.warning(f"Key {entity['text']} not found")
                continue

            enrichments.append({"name": "gender", "value": gender})

    return jsonify({"enrichments": enrichments})


@app.route("/api/list-genders", methods=["GET"])
@check_token
def list_genders() -> Any:
    return jsonify([{"value": gender, "label": gender} for gender in app.possible_genders])


@app.route("/", methods=["GET"])
def get_health() -> Any:
    return jsonify({"status": "ok"}), 200


if __name__ == "__main__":
    # do NOT run this in prod, flask dev server is not meant for that
    # check the dockerfile which starts a gunicorn server
    create_app().run(host="0.0.0.0", debug=True)
