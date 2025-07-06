function computeAQI({ pm2_5, pm10, no2 }) {
  // very simplified thresholds
  let score = 0;

  if (pm2_5) score = Math.max(score, aqiFromPM25(pm2_5));
  if (pm10) score = Math.max(score, aqiFromPM10(pm10));
  if (no2) score = Math.max(score, aqiFromNO2(no2));

  return score;
}

function aqiFromPM25(val) {
  if (val <= 30) return 50;
  if (val <= 60) return 100;
  if (val <= 90) return 200;
  return 300;
}

function aqiFromPM10(val) {
  if (val <= 50) return 50;
  if (val <= 100) return 100;
  if (val <= 250) return 200;
  return 300;
}

function aqiFromNO2(val) {
  if (val <= 40) return 50;
  if (val <= 80) return 100;
  if (val <= 180) return 200;
  return 300;
}

module.exports = { computeAQI };
