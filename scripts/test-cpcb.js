// scripts/test-cpcb.js
const { getCPCBDashboardData } = require("../services/cpcbDashboard");

(async () => {
  try {
    const raw = await getCPCBDashboardData();     // today’s date by default
    const rows = JSON.parse(raw);
    console.log(`✅ Received ${rows.length} station‑parameter rows`);
    console.log(rows.slice(0, 5));                // show first 5
  } catch (err) {
    console.error("❌ CPCB fetch failed:", err.message);
  }
})();
