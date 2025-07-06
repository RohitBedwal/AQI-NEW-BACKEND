// routes/location.js
const express  = require("express");
const router   = express.Router();
const { createClient } = require("@supabase/supabase-js");
const forecast = require("../services/forecast"); 
const { computeAQI } = require("../helpers/pivotPollutants");
     // your dummy/getForecast
require("dotenv").config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY   // service‑role key!
);

// helper: 5 km box
function bbox(lat, lon, km = 5) {
  const d = km / 111;                    // ~1° ≈111 km
  return { latMin: lat - d, latMax: lat + d, lonMin: lon - d, lonMax: lon + d };
}
router.get('/ap',(req,res)=>res.send('og'))

// POST /location  { lat, lon }
router.post("/", async (req, res) => {
  try {
    console.log("Received POST /location with body:", req.body);

    const lat = Number(req.body.lat);
    const lon = Number(req.body.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      return res.status(400).json({ error: "lat & lon required" });
    }

    const { latMin, latMax, lonMin, lonMax } = bbox(lat, lon, 5);
    const sinceIso = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from("readings")
      .select("*")
      .gte("recorded_at", sinceIso)
      .filter("latitude",  "gte", latMin)
      .filter("latitude",  "lte", latMax)
      .filter("longitude", "gte", lonMin)
      .filter("longitude", "lte", lonMax)
      .order("recorded_at", { ascending: false })
      .limit(1);

    if (error) {
      console.error("🔥 Supabase error:", error);
      return res.status(500).json({ error: error.message });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ error: "No recent AQI data nearby" });
    }

    const latest = data[0];

    let forecastData = { forecast: null };
    try {
      forecastData = await forecast.getForecast(lat, lon);
    } catch (e) {
      console.error("⚠️ forecast fetch failed:", e.message);
    }

    const aqi = latest.aqi ?? computeAQI(latest);

    return res.json({
      location: { lat, lon },
      current: {
        recorded_at: latest.recorded_at,
        aqi,
        pm25: latest.pm25 ?? latest.pm2_5,
        pm10: latest.pm10,
        no2:  latest.no2,
        so2:  latest.so2,
        co:   latest.co,
        o3:   latest.ozone ?? latest.o3,
        nh3:  latest.nh3,
      },
      forecast: forecastData.forecast
    });

  } catch (err) {
    console.error("❌ Unexpected server error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


module.exports = router;
