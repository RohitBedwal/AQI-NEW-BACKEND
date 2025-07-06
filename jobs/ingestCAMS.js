const axios = require("axios");
const db = require("../services/db");

async function ingestCAMS(lat, lon) {
  const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&hourly=pm2_5,pm10,no2,so2,o3`;

  const { data } = await axios.get(url);
  const lastIndex = data.hourly.time.length - 1;

  const reading = {
    latitude: lat,
    longitude: lon,
    recorded_at: new Date(data.hourly.time[lastIndex]),
    source: "cams",
    pm2_5: data.hourly.pm2_5[lastIndex],
    pm10: data.hourly.pm10[lastIndex],
    no2: data.hourly.no2[lastIndex],
    so2: data.hourly.so2[lastIndex],
    o3: data.hourly.o3[lastIndex],
  };

  await db.from("readings").insert(reading);
}

module.exports = ingestCAMS;
