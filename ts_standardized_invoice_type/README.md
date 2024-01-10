# ts_standardized_invoice_type enrichment

NestJS is used to scaffold our enrichments. I highly recommend you to read their documentation: https://docs.nestjs.com/

# Installation

1. `yarn`;
2. Configure `PORT` in the `.env`
3. `yarn dev`

# Testing

For testing, `jest` is used. You can run the tests with `yarn test`.

JSON files are used to mock the data the enrichment receives. These files are located in `src/services/mocks`. This way you can also get a grasp how the incoming data will look like.

# Usage

The following paths will be available:

- POST `/invoice-type`: the actual logic of the enrichment
- POST `/invoice-type/options`: generates options that are rendered during human validation in Metamaze.

# Logic

The core logic of this enrichment lives in `src/services/invoice-type.service.ts`
