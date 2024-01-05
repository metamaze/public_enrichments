# ts_standardized_invoice_type enrichment

## Installation

1. Configure you .npmrc to user the Metamaze npm registry.
  ```
  //npm.pkg.github.com/:_authToken=<TOKEN>
  @metamaze:registry=https://npm.pkg.github.com
  ```
2. Install dependencies

  ```
  yarn install
  ```
3. Create and `.env` file based on the `.env.example` file

## Development

Use the `develop` branch for development. The `main` branch is reserved for production releases and `staging` for staging releases.


## ENV variables

### Validation

All env variables are required to run the enrichments app. If you add a new env variable, please add it to the `.env.example` file as well and corresponding validation to the `validateEnv` function in `src/env.ts`.

### Known env variables

| Variable | Description | Default |
| --- | --- | --- |
| `PORT` | Port to run the server on | `4000` |
| `SENTRY_DSN` | Sentry DSN for error reporting | `''` |
| `AZURE_KEYVAULT_URI` | URI of the Azure Keyvault | `''` |

The others are defined in the [`.env.example`](./.env.example) file.