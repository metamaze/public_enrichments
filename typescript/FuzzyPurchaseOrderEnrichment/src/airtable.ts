import axios from "axios";

const URL = `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE}`;

export async function findRecord(value, field) {
  const result = await axios.get(
    `${URL}/suppliers?filterByFormula=("${value}",{${field}})`,
    {
      headers: { Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}` },
    }
  );
  return result;
}

export async function findRecords() {
  const result = await axios.get(`${URL}/suppliers`, {
    headers: { Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}` },
  });
  return result;
}
