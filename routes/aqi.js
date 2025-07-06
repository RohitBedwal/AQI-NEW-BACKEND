const express = require("express");
const db = require("../services/db");
const router = express.Router();
const { getAQIData } = require("../services/openaq");
const forecastService = require("../services/forecast");

const { getCPCBDataViaBrowser } = require('../services/cpcbDashboard');
getCPCBDataViaBrowser().then(console.log).catch(console.error);
// --- POST /api/aqi/manual -------------------------------------
router.post("/manual", async (req, res) => {
  const {
    latitude,
    longitude,
    aqi,
    pm2_5,
    pm10,
    no2,
    so2,
    co,
    o3,
    source = "manual",
    recorded_at = new Date(),
  } = req.body;

  if (
    !Number.isFinite(+latitude) ||
    !Number.isFinite(+longitude) ||
    !Number.isFinite(+aqi)
  ) {
    return res.status(400).json({
      error: "Valid latitude, longitude, and aqi are required",
    });
  }

  const { error } = await db.from("readings").insert({
    latitude: +latitude,
    longitude: +longitude,
    aqi: +aqi,
    pm2_5,
    pm10,
    no2,
    so2,
    co,
    o3,
    source,
    recorded_at,
  });

  if (error) return res.status(500).json({ error: error.message });
  return res.json({ status: "saved" });
});

// --- GET /api/aqi/current?lat=..&lon=.. -----------------------
router.get("/current", async (req, res) => {
  const { lat, lon } = req.query;
  const latNum = parseFloat(lat);
  const lonNum = parseFloat(lon);

  if (!Number.isFinite(latNum) || !Number.isFinite(lonNum)) {
    return res.status(400).json({ error: "lat & lon must be valid numbers" });
  }

  const { data, error } = await db.supabase.rpc("get_latest_aqi", {
    q_lat: latNum,
    q_lon: lonNum,
  });

  if (error) return res.status(500).json({ error: error.message });
  if (!data?.length) return res.status(404).json({ message: "No data found" });

  return res.json(data[0]);
});

// --- GET /api/aqi/history?lat=..&lon=..&days=7 ----------------
router.get("/history", async (req, res) => {
  const { lat, lon, days = 30 } = req.query;
  const latNum = parseFloat(lat);
  const lonNum = parseFloat(lon);
  const daysNum = parseInt(days, 10) || 30;

  if (!Number.isFinite(latNum) || !Number.isFinite(lonNum)) {
    return res.status(400).json({ error: "lat & lon must be valid numbers" });
  }

  const since = new Date(Date.now() - daysNum * 24 * 60 * 60 * 1000);

  const { data, error } = await db.supabase
    .from("readings")
    .select("*")
    .gte("recorded_at", since.toISOString())
    .filter("latitude", "gte", latNum - 0.1)
    .filter("latitude", "lte", latNum + 0.1)
    .filter("longitude", "gte", lonNum - 0.1)
    .filter("longitude", "lte", lonNum + 0.1)
    .order("recorded_at", { ascending: true });

  if (error) return res.status(500).json({ error: error.message });

  return res.json(data || []);
});

// --- GET /api/aqi/forecast?lat=..&lon=.. ----------------------
router.get("/forecast", async (req, res) => {
  const { lat, lon } = req.query;
  console.log(lat,lon ,"ff")
  const latNum = parseFloat(lat);
  const lonNum = parseFloat(lon);

  if (!Number.isFinite(latNum) || !Number.isFinite(lonNum)) {
    return res.status(400).json({ error: "lat & lon must be valid numbers" });
  }

  try {
    const forecastData = await forecastService.getForecast(latNum, lonNum);
    return res.json(forecastData);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// --- GET /api/aqi/live?lat=..&lon=.. --------------------------
router.get("/live", async (req, res) => {
  const latNum = Number.parseFloat(req.query.lat);
  const lonNum = Number.parseFloat(req.query.lon);

  if (!Number.isFinite(latNum) || !Number.isFinite(lonNum)) {
    return res.status(400).json({ error: "lat & lon must be valid numbers" });
  }

  try {
    const liveData = await getAQIData({ lat: latNum, lon: lonNum });

    if (!liveData) {
      return res
        .status(404)
        .json({ error: "No data found near this location" });
    }

    res.json(liveData);
  } catch (err) {
    console.error("🌐 OpenAQ Error:", err.message);
    res.status(500).json({ error: "Failed to fetch live AQI" });
  }
});

module.exports = router;
