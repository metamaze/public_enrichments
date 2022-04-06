import axios from "axios";

const URL = `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE}`;

export async function fetchLeadTimes() {
  const result = await axios.get(`${URL}/lead-times`, {
    headers: { Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}` },
  });
  return result;
}

export async function fetchIncomingDelivery() {
  const result = await axios.get(`${URL}/incoming-delivery`, {
    headers: { Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}` },
  });
  return result;
}

export async function fetchOrders() {
  const result = await axios.get(`${URL}/orders`, {
    headers: { Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}` },
  });
  return result;
}

export async function findRecord(
  table: Table,
  value,
  field: LeadTimes | IncomingDelivery | Orders
) {
  const result = await axios.get(
    `${URL}/${table}?filterByFormula={${field}}=${JSON.stringify(value)}`,
    {
      headers: { Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}` },
    }
  );
  return result;
}

export enum Table {
  LEAD_TIMES = "lead-times",
  INCOMING_DELIVERY = "incoming-delivery",
  ORDERS = "orders",
}

export enum LeadTimes {
  ARTICLE_NUMBER = "article-number",
  AX_PURCHASE_LEAD_TIME = "ax-purchase-lead-time",
  STOCK_LEVEL = "stock-level",
}

export enum IncomingDelivery {
  ARTICLE_NUMBER = "article-number",
  DELIVERY_DATE = "delivery-date",
  DELIVERY_QUANTITY = "delivery-quantity",
}

export enum Orders {
  ARTICLE_NUMBER = "article-number",
  QUANTITY = "quantity",
}
