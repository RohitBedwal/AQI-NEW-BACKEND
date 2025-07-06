// jobs/ingestDataGovAQI.js
const axios       = require("axios");
const dotenv      = require("dotenv");
const { createClient } = require("@supabase/supabase-js");
const { pivotRecords } = require("../helpers/pivotPollutants.js");


dotenv.config();

/* ── CONFIG ───────────────────────────── */
const API_KEY  = process.env.DATA_GOV_API_KEY;
const SUPA_URL = process.env.SUPABASE_URL;
const SUPA_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const LIMIT    = 1000;
const RESOURCE = "3b01bcb8-0b14-4abf-b6f2-c1bfd384ba69"; // CPCB realtime

if (!API_KEY || !SUPA_URL || !SUPA_KEY) {
  console.error("❌  Missing .env vars"); process.exit(1);
}

const supabase = createClient(SUPA_URL, SUPA_KEY);

/* ── helpers ──────────────────────────── */
async function fetchPage(offset = 0) {
  const url = `https://api.data.gov.in/resource/${RESOURCE}`;
  const { data } = await axios.get(url, {
      params: { "api-key": API_KEY, format: "json", limit: LIMIT, offset },
      timeout: 15000
    });
    // console.log(data)
  return data.records || [];
}


/* ── main ─────────────────────────────── */
(async () => {
  let offset = 0, total = 0;
  

  while (true) {
    const page = await fetchPage(offset);
    if (page.length === 0) break;

    const pivoted = pivotRecords(page);

    if (offset === 0) {
      console.log("🔍 sample row:", pivoted[0]);
    }

    const { data: inserted, error } = await supabase
  .from("readings")
  .insert(pivoted, { returning: "minimal" });

if (error) {
  console.error("❌ Supabase insert error:", error.message);
  process.exit(1);
}

console.log(`✅ Inserted rows: ${pivoted.length}, Supabase accepted: ${inserted?.length ?? 0}`);

    if (error) {
      console.error("❌ Supabase insert error:", error.message);
      process.exit(1);
    }

    // console.log(`✅ Inserted ${pivoted.length} rows (offset ${offset})`);
    total  += pivoted.length;
    offset += LIMIT;
  }

  console.log(`🚀 Finished. Total rows ingested: ${total}`);
  process.exit(0);
})();


