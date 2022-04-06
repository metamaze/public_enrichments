import {
  fetchLeadTimes,
  findRecord,
  LeadTimes,
  Orders,
  Table,
} from "./airtable";
import {
  CompositeRequestBody,
  Enrichment,
  EntityRequestBody,
  IncomingDelivery,
  LeadTime,
  Order,
  RequestBody,
  Record,
} from "./types";

enum Code {
  PASS = "PASS",
  PASS_MESSAGE_STANDARD_LEAD_TIME = "PASS_MESSAGE_STANDARD_LEAD_TIME",
  AUTO_MESSAGE_ON_HOLD = "AUTO_MESSAGE_ON_HOLD",
}

const ENRICHMENT_NAME = "Lead Time Purchase Order";

// Entities used
const DOCUMENT_DATE = "document_date";

// COMPOSITE NAME
const ORDERLINE = "line_item";
// COMPOSITE CHILDREN
const DUE_DATE = "due_date";
const ARTICLE_NUMBER = "article_number";
const QUANTITY = "quantity";

/**
 * Will fetch all rows of airtable to create a fusion map so we can do a 'fuzzy search' on all relevant entities
 *
 * @param req
 * @param res
 */
export default async function calculateEnrichments(req, res) {
  const body: RequestBody = req.body;
  const documentId = body.documentId;
  const enrichments: Enrichment[] = [];

  try {
    // Only need the entities from the request body
    const entities = body.entities;
    const composites = body.composites;
    const orderlines = composites.filter((c) => c.entityName === ORDERLINE);
    const documentDate = entities.find((e) => e.entityName === DOCUMENT_DATE);
    const documentDueDate = entities.find((e) => e.entityName === DUE_DATE);

    await Promise.all(
      orderlines.map(async (o) => {
        try {
          const code: Code = await calculateOrderLine(
            o,
            documentDate,
            documentDueDate ?? null
          );

          const enrichment: Enrichment = {
            link: o.link,
            name: ENRICHMENT_NAME,
            value: code,
          };
          enrichments.push(enrichment);
        } catch (e) {
          const failedEnrichment: Enrichment = {
            link: o.link,
            name: ENRICHMENT_NAME,
            exception: e.message,
          };
          enrichments.push(failedEnrichment);
        }
      })
    );

    if (!Array.isArray(entities) || entities.length === 0)
      throw new Error("No entities provided.");
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

async function calculateOrderLine(
  orderline: CompositeRequestBody,
  documentDate: EntityRequestBody,
  dueDateFromDocument?: EntityRequestBody | null
) {
  const dueDate = orderline.composites.find((c) => c.entityName === DUE_DATE);
  const articleNumber =
    orderline.composites.find((c) => c.entityName === ARTICLE_NUMBER) ??
    dueDateFromDocument;
  const quantity = orderline.composites.find((c) => c.entityName === QUANTITY);
  if (!dueDate) throw new Error("FAIL: no due date on oder line/document");
  if (!documentDate) throw new Error("FAIL: no document date");
  if (!dueDate.parsedValue || !documentDate.parsedValue)
    throw new Error(
      "FAIL: no parsed value, cannot calculate lead time on customer order"
    );
  if (!articleNumber) throw new Error("FAIL: no article number.");

  const dueDateParsed = Date.parse(dueDate.parsedValue);
  const documentDateParsed = Date.parse(documentDate.parsedValue);
  const diffTime = Math.abs(dueDateParsed - documentDateParsed);
  const leadTime = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  let leadTimeRecord: LeadTime[] = [];
  let incomingDeliveryRecords: IncomingDelivery[] = [];
  let orderRecords: Order[] = [];

  try {
    leadTimeRecord = await getLeadTimeRecord(articleNumber.text);
  } catch (e) {
    throw new Error(
      `FAIL: could not find an entry in the lead-time table for article number: ${articleNumber.text}. Add this in a new row.`
    );
  }

  const axPurchaseLeadTime = parseFloat(
    leadTimeRecord[0]["ax-purchase-lead-time"]
  );
  const stockLevel = parseFloat(leadTimeRecord[0]["stock-level"]);
  if (!axPurchaseLeadTime)
    throw new Error(
      `FAIL: no ax-purchase-lead-time provided for article number: ${articleNumber.text}`
    );

  if (leadTime > axPurchaseLeadTime + 3) return Code.PASS;
  if (
    leadTime < axPurchaseLeadTime &&
    stockLevel > parseFloat(quantity.parsedValue || quantity.text)
  )
    return Code.PASS_MESSAGE_STANDARD_LEAD_TIME;
  if (leadTime < axPurchaseLeadTime) {
    try {
      incomingDeliveryRecords = await getIncomingDeliveryRecord(
        articleNumber.text
      );
    } catch (e) {
      // no entry
      return Code.AUTO_MESSAGE_ON_HOLD;
    }
    const match = incomingDeliveryRecords.find((i) => {
      const date = new Date(i["delivery-date"]);
      const deadline = date.setDate(date.getDate() + 8);
      return deadline < dueDateParsed;
    });

    if (!match) return Code.AUTO_MESSAGE_ON_HOLD;

    try {
      orderRecords = await getOrderRecord(articleNumber.text);
    } catch (e) {
      throw new Error(
        `FAIL: could not find an entry in the orders table for article number: ${articleNumber.text}. Add this in a new row.`
      );
    }
    const claimedQuantity = orderRecords
      .map((o) => parseFloat(o.quantity))
      .reduce((result, quantity) => (result += quantity), 0);

    const deliveryQuantity = parseFloat(match["delivery-quantity"]);

    if (claimedQuantity - deliveryQuantity > parseFloat(quantity.text)) {
      return Code.PASS_MESSAGE_STANDARD_LEAD_TIME;
    } else return Code.AUTO_MESSAGE_ON_HOLD;
  }
  return Code.AUTO_MESSAGE_ON_HOLD;
}

async function getLeadTimeRecord(articleNumber: string): Promise<LeadTime[]> {
  const leadTimeRecords: Record<LeadTime>[] = (
    await findRecord(Table.LEAD_TIMES, articleNumber, LeadTimes.ARTICLE_NUMBER)
  ).data.records;
  return leadTimeRecords.map((r) => r.fields);
}

async function getIncomingDeliveryRecord(
  articleNumber: string
): Promise<IncomingDelivery[]> {
  const incomingDeliveryRecords: Record<IncomingDelivery>[] = (
    await findRecord(
      Table.INCOMING_DELIVERY,
      articleNumber,
      LeadTimes.ARTICLE_NUMBER
    )
  ).data.records;
  return incomingDeliveryRecords.map((r) => r.fields);
}

async function getOrderRecord(articleNumber: string): Promise<Order[]> {
  const orderRecords: Record<Order>[] = (
    await findRecord(Table.ORDERS, articleNumber, LeadTimes.ARTICLE_NUMBER)
  ).data.records;
  return orderRecords.map((r) => r.fields);
}
