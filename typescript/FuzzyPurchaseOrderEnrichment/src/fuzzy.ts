import { findRecords } from "./airtable";
import Fuse from "fuse.js";
import {
  AirTableRecord,
  Enrichment,
  EntityRequestBody,
  FuseAirTableRecord,
  Match,
  RequestBody,
} from "./types";

const ENRICHMENT_NAME = "Fuzzy Purchase Order";

/**
 * Will fetch all rows of airtable to create a fusion map so we can do a 'fuzzy search' on all relevant entities.
 * If an entity occurs multiple times, the one with the highest confidence is skipped. If the match is not above the threshold, it will go to the next kind of entities.
 *
 * @param req
 * @param res
 */
export default async function fuzzy(req, res) {
  const body: RequestBody = req.body;
  const documentId = body.documentId;
  const enrichments: Enrichment[] = [];

  try {
    // Only need the entities from the request body
    const entities = body.entities;

    if (!Array.isArray(entities) || entities.length === 0)
      throw new Error("No entities provided.");

    // Column/field names in Airtable.
    const FIELDS = [
      "supplierPostalCode",
      "supplierStreet",
      "supplierCity",
      "supplierName",
      "supplierHouseNumber",
      "supplierId",
    ];

    // Fetching airtable records
    const result = await findRecords();
    const records = result.data.records;

    // Initializing fuzzy search based on airtable records
    const fuse = new Fuse(
      records.map((r) => r.fields),
      {
        keys: FIELDS,
        includeScore: true,
        threshold: 0.5,
      }
    );

    const enrichment = enrichmentByPriority(entities, fuse, documentId);

    enrichments.push(enrichment);
    res.send({ enrichments });
  } catch (e) {
    const exceptionEnrichment: Enrichment = {
      name: ENRICHMENT_NAME,
      link: documentId,
      exception: `Something went wrong: ${e.message || JSON.stringify(e)}`,
    };
    res.send({ enrichments: [exceptionEnrichment] });
  }
}

/**
 * Search for best record in the fusion map based on the passed entity.
 *
 * @param entity entity from request body
 * @param fuse fusion map
 * @returns {Enrichment} best match that is converted into an enrichment or an exception enrichment
 */
function fuzzySearch(
  entity: EntityRequestBody,
  fuse: Fuse<any>
): FuseAirTableRecord {
  const fuzzyRecords = fuse.search(entity.text) as FuseAirTableRecord[]; // text contains the actual value.
  // According to fuse.js docs: score 0 = perfact match, 1 = absolute mismatch
  const bestMatch: FuseAirTableRecord = fuzzyRecords.reduce(
    (highest, current) => {
      if (highest === null) return current;
      highest?.score < current?.score ? highest : current;
    },
    null
  );
  return bestMatch ?? null;
}

/**
 * Search for the best match while comparing multiple entity values
 * @param {Match[]} matches all entity values with the same entity + their match from the fuzzy search
 * @returns {Match} best match
 */
function bestMatch(matches: Match[]) {
  let best: Match = null;

  for (const match of matches) {
    if ((match?.match?.score || 1) < (best?.match?.score || 1)) {
      best = match;
    }
    if (best === null) best = match;
  }
  return best;
}

/**
 * Generate enrichment based on priority.
 * @param entities
 * @param fuse
 * @param documentId
 * @returns
 */
function enrichmentByPriority(
  entities: EntityRequestBody[],
  fuse: Fuse<any>,
  documentId: string
): Enrichment {
  // Prio 1 = company_name

  const bestCompanyNameMatch = bestMatch(
    entities
      .filter((e) => e.entityName === "company_name")
      .map((e) => ({
        match: fuzzySearch(e, fuse),
        entity: e,
      }))
  );
  console.log(bestCompanyNameMatch);
  if (bestCompanyNameMatch?.match)
    return {
      link: documentId,
      name: ENRICHMENT_NAME,
      value: bestCompanyNameMatch.match.item.supplierId,
    };

  // Prio 2 = company_street_number

  const bestCompanyStreetNumberMatch = bestMatch(
    entities
      .filter((e) => e.entityName === "company_street_number")
      .map((e) => ({
        match: fuzzySearch(e, fuse),
        entity: e,
      }))
  );
  if (bestCompanyStreetNumberMatch?.match)
    return {
      link: documentId,
      name: ENRICHMENT_NAME,
      value: bestCompanyStreetNumberMatch.match.item.supplierId,
    };

  // Prio 3 = company city

  const bestCompanyCityMatch = bestMatch(
    entities
      .filter((e) => e.entityName === "company_city")
      .map((e) => ({
        match: fuzzySearch(e, fuse),
        entity: e,
      }))
  );
  if (bestCompanyCityMatch?.match)
    return {
      link: documentId,
      name: ENRICHMENT_NAME,
      value: bestCompanyCityMatch.match.item.supplierId,
    };

  // Prio 4 = company postal code

  const bestCompanyPostalCodeMatch = bestMatch(
    entities
      .filter((e) => e.entityName === "company_postal_code")
      .map((e) => ({
        match: fuzzySearch(e, fuse),
        entity: e,
      }))
  );
  if (bestCompanyPostalCodeMatch?.match)
    return {
      link: documentId,
      name: ENRICHMENT_NAME,
      value: bestCompanyPostalCodeMatch.match.item.supplierId,
    };
  return {
    link: documentId,
    name: ENRICHMENT_NAME,
    exception: "Could not find a match.",
  };
}
