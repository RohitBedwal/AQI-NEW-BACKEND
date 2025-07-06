// /jobs/ingestCPCB.js

const axios = require('axios');
const cheerio = require('cheerio');
const db = require('../services/db');

async function scrapeCPCB() {
  try {
    const URL = 'https://app.cpcbccr.com/caaqm-dashboard/caaqm-landing/cities';

    const { data: html } = await axios.get(URL                                                                                                                                                                                                              );

    const $ = cheerio.load(html);
    const rows = $('table tbody tr'); // Each row = station

    for (let i = 0; i < rows.length; i++) {
      const cols = $(rows[i]).find('td');
      if (cols.length < 6) continue;

      const city = $(cols[0]).text().trim();
      const location = $(cols[1]).text().trim();
      const aqi = parseInt($(cols[2]).text().trim());
      const category = $(cols[3]).text().trim();
      const pollutant = $(cols[4]).text().trim();
      const time = $(cols[5]).text().trim();

      // You may need to geocode or maintain a city-location-latlon mapping.
      // For now, we'll insert basic data
      await db.from('readings').insert({
        latitude: null,   // If known
        longitude: null,  // If known
        aqi,
        source: 'cpcb',
        city,
        location,
        recorded_at: new Date(), // Better: parse from CPCB time
      });
    }

    console.log(`✅ CPCB AQI scraped and stored.`);
  } catch (err) {
    console.error('❌ CPCB scrape error:', err.message);
  }
}

// 🔁 Schedule job (every 30 min)
function startCPCBJob() {
  scrapeCPCB(); // run immediately on boot

  setInterval(() => {
    console.log('🔄 Running CPCB AQI ingestion...');
    scrapeCPCB();
  }, 30 * 60 * 1000); // 30 minutes
}

module.exports = { startCPCBJob };
