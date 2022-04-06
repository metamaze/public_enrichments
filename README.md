# Enrichments for Metamaze

In Metamaze, enrichments allow you to embed custom code, custom logic and additional data sources into your processing pipeline by integrating an API call to an external system. Rather than doing the custom logic after Metamaze extraction, by using enrichments you can have human validation on the enrichments as necessary. That way, your operators can stay in the same view and don't need to switch applications.

Examples of when it makes sense to use an enrichment

- For external data lookup
  - Lookup the BIC code for a given IBAN number
  - Lookup of product category or accounting code based on the extracted product description
  - Lookup of contract type based on contract number
- For intelligent decision making
  - Interpreting extracted text and classifying it
  - After extracting the relevant clause and then deciding if a marriage contract is of type "separate" or "joint".
  - After extracting a formula for interest rates, deciding if it is of type "fixed", "mixed" or "floating".
- For data validation. Note that for simple logic a Business Rule can be used too.
  - Validate IBAN number
  - Validate VAT number
- For embedding custom machine learning models
  - Sentiment analysis
  - Existing or 3rd party extraction models
- For custom parsing or standardisation
  - Geocoding of addresses
  - Standardising non-standard entities like product codes.

# Metamaze provides public code example in:

- Typescript / javascript
- Python

## Get help

For any questions, feel free to open an issue here on GitHub or contact the Metamaze team at support@metamaze.eu.
