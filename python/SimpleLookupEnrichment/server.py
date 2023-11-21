"""
This is a Python example on how to create a custom data enrichment component using Python and Flask.

For more information, see the Metamaze documentation or contact us at support@metamaze.eu.
"""

import logging
from os import environ as env

from flask import Flask, jsonify, request
from flask_httpauth import HTTPTokenAuth

app = Flask(__name__)
# CORS(app, support_credentials=True)
auth = HTTPTokenAuth(scheme="Bearer")

# Define your Bearer token
BEARER_TOKEN = env.get("BEARER_TOKEN", "[optionally set bearer token here]")

# Example reference data: each line is a supplier with a name, an address, and a VAT number.
# This is a very simple example, but you can use any data source you want.
# In a real-world scenario, you would probably use a database or a file on disk.

EXAMPLE_SUPPLIERS_DB = [
    ("ABC Company", "Kerkstraat 1, 1000 Brussel", "BE0123456789"),
    ("XYZ Corporation", "123 Main St, New York", "US987654321"),
    ("PQR Enterprises", "456 Elm St, Los Angeles", "US123456789"),
    ("LMN Corporation", "789 Oak St, Miami", "US543216789"),
    ("DEF Ltd", "10 Baker St, London", "GB987654321"),
    ("GHI SARL", "20 Rue de la Paix, Paris", "FR123456789"),
    ("JKL Srl", "Via Roma 1, Rome", "IT987654321"),
    ("MNO GmbH", "Hauptstraße 10, Berlin", "DE123456789"),
    ("RST S.L.", "Calle Mayor 5, Madrid", "ES987654321"),
    ("UVW Sp. z o.o.", "ul. Główna 15, Warsaw", "PL123456789"),
]

SUPPLIERS = [
    {
        "id": vat_number,
        "company_name": company_name,
        "company_address": address,
        "company_vat_number": vat_number,
    }
    for company_name, address, vat_number in EXAMPLE_SUPPLIERS_DB
]


@auth.verify_token
def verify_token(token):
    return bool(token == BEARER_TOKEN)


# This is the endpoint that will be called by the Metamaze platform.
# Example payload:
# {
#     "metadata": {},
#     "version": "2",
#     "document": {
#         "id": "655cb1ad79fd660fdd439e3f",
#         "language": "en-us",
#         "name": "Example document for enrichment.docx",
#         "createdAt": "2023-11-21T13:33:33.089Z",
#         "updatedAt": "2023-11-21T13:39:06.922Z",
#     },
#     "upload": {
#         "id": "655cb169032f2a199ec908c1",
#         "createdAt": "2023-11-21T13:32:25.753Z",
#         "updatedAt": "2023-11-21T13:38:21.624Z",
#     },
#     "type": {"id": "655cb001ea9c74fe1f27f873", "name": "Purchase Order"},
#     "pages": [
#         {
#             "id": "655cb1ad79fd660fdd439dfd",
#             "text": "Example document for enrichment VAT number : ES 987 - 654 - 321 Other data . . .",
#             "index": 0,
#             "height": 4251,
#             "width": 3044,
#         }
#     ],
#     "linkedEnrichments": [
#         {
#             "id": "655cb2cdea9c74fe1f27fded",
#             "enrichment": {"id": "655cb14cea9c74fe1f27f8c6", "name": "Find supplier"},
#             "exception": "Request failed with status code 405",
#             "link": null,
#             "statusCode": 405,
#             "value": null,
#         }
#     ],
#     "annotations": [
#         {
#             "ai": false,
#             "approved": true,
#             "link": "655cb2cd0ec0396c6afa9ad3",
#             "text": "ES 987 - 654 - 321",
#             "parsed": "",
#             "indices": [
#                 {"pageId": "655cb1ad79fd660fdd439dfd", "startIndex": 45, "endIndex": 63}
#             ],
#             "user": {"id": "5cd5732a2971c55dec5fd8b9"},
#             "entity": {"id": "655cb0e8ea9c74fe1f27f89a", "name": "VAT number"},
#             "coords": {"x0": 720, "y0": 615, "x1": 1162, "y1": 677},
#         }
#     ],
# }


@app.route("/api/find-supplier", methods=["GET"])
@auth.login_required
def find_supplier():
    content = request.json
    vat_number = None

    # Find the first value of the entity with name "VAT number"
    for annotation in content["annotations"]:
        if annotation["entity"]["name"] == "VAT number":
            vat_number = annotation["text"]
            link = annotation["link"]
            break  # Stop at first match of VAT number

    # Stop if no VAT number was found
    if vat_number is None:
        return jsonify({"enrichments": []})

    # To improve matching rates, we strip all punctuation and spaces from the VAT number
    vat_number = "".join([c for c in vat_number if c.isalnum()])

    # Use that vat number to find the supplier in the database
    supplier = next(
        (supplier for supplier in SUPPLIERS if supplier["company_vat_number"] == vat_number),
        None,
    )
    logging.info(f"Found supplier: {supplier}")

    if supplier:
        return jsonify({"enrichments": [{"name": "Find supplier", "value": [supplier], "link": link}]})
    else:
        return jsonify({"enrichments": []})


@app.route("/api/list-suppliers", methods=["GET"])
@auth.login_required
def list_suppliers():
    # The keys of the dictionaries contained in the suppliers list should be the same as the
    # configured column names. These column names are set in the enrichment settings in the
    # Metamaze platform.
    #
    # For example, if you have a column called "company_name", you should have a key called
    # "company_name" in the dictionary.

    # Example value
    # [
    #     {
    #         "id": "BE0123456789",
    #         "company_name": "ABC Company",
    #         "company_address": "Kerkstraat 1, 1000 Brussel",
    #         "company_vat_number": "BE0123456789",
    #     },  ...
    # ]
    return jsonify(SUPPLIERS)


if __name__ == "__main__":
    # do NOT run this in prod, flask dev server is not meant for that
    # check the dockerfile which starts a gunicorn server

    app.run(host="0.0.0.0", debug=True)

    # to debug locally, use the following command:
    # FLASK_APP=server.py FLASK_ENV=development flask run --port 5001
