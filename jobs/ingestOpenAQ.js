// jobs/ingestOpenAQ.js
const cron = require('node-cron');
const db = require('../services/db.js');
const { getAQIData } = require('../services/openaq.js');

const TARGET_LOCATIONS = [
  { lat: 13.0827, lon:  80.2707, name: 'Delhi' },
  { lat: 28.0380, lon: 73.3170, name: 'Bikaner' },
  { lat: 26.8467, lon: 80.9462, name: 'Lucknow' },
  // Add more as needed
];

async function ingestOpenAQ() {
  console.log(`🕒 Ingesting OpenAQ @ ${new Date().toISOString()}`);
  for (const { lat, lon, name } of TARGET_LOCATIONS) {
    try {
      const data = await getAQIData({ lat, lon });
      if (!data?.measurements?.length) {
        console.warn(`⚠️ No measurements for ${name}`);
        continue;
      }

      // Get PM2.5 and AQI from the response
      const pm25 = data.measurements.find((m) => m.parameter === 'pm25')?.value;
      const aqi = pm25 || 100; // Use PM2.5 as proxy AQI

      const row = {
        latitude: lat,
        longitude: lon,
        aqi,
        pm25,
        source: 'openaq',
        recorded_at: new Date(),
      };

      const { error } = await db.from('readings').insert(row);
      if (error) console.error(`❌ DB insert error (${name}):`, error.message);
      else console.log(`✅ Saved AQI for ${name}`);
    } catch (err) {
      console.error(`🔥 Error fetching AQI for ${name}:`, err.message);
    }
  }
}

// Schedule every 15 minutes
function startIngestionJob() {
  cron.schedule('*/15 * * * *', ingestOpenAQ);
  console.log('🔁 Scheduled OpenAQ ingestion every 15 minutes');
}

module.exports = { startIngestionJob };
