/* ── AQI break‑points (India, CPCB) ───────────────────────── */
const bp = {
  pm25: [
    [0, 30, 0, 50], [31, 60, 51, 100], [61, 90, 101, 200],
    [91, 120, 201, 300], [121, 250, 301, 400], [251, 500, 401, 500]
  ],
  pm10: [
    [0, 50, 0, 50], [51, 100, 51, 100], [101, 250, 101, 200],
    [251, 350, 201, 300], [351, 430, 301, 400], [431, 600, 401, 500]
  ],
  no2: [
    [0, 40, 0, 50], [41, 80, 51, 100], [81, 180, 101, 200],
    [181, 280, 201, 300], [281, 400, 301, 400], [401, 800, 401, 500]
  ],
  so2: [
    [0, 40, 0, 50], [41, 80, 51, 100], [81, 380, 101, 200],
    [381, 800, 201, 300], [801, 1600, 301, 400], [1601, 2400, 401, 500]
  ],
  co: [
    [0, 1, 0, 50], [1, 2, 51, 100], [2, 10, 101, 200],
    [10, 17, 201, 300], [17, 34, 301, 400], [34, 50, 401, 500]
  ],
  ozone: [
    [0, 50, 0, 50], [51, 100, 51, 100], [101, 168, 101, 200],
    [169, 208, 201, 300], [209, 748, 301, 400], [749, 1000, 401, 500]
  ]
};

/* Linear interpolation */
function subIndex(Cp, [Clow, Chigh, Ilow, Ihigh]) {
  return ((Ihigh - Ilow) / (Chigh - Clow)) * (Cp - Clow) + Ilow;
}

/* Given a row with pollutant fields, return max sub‑index (AQI) */
function computeAQI(row) {
  let max = 0;
  for (const [key, table] of Object.entries(bp)) {
    const val = row[key];
    if (val == null) continue;
    for (const range of table) {
      if (val >= range[0] && val <= range[1]) {
        max = Math.max(max, Math.round(subIndex(val, range)));
        break;
      }
    }
  }
  return max || null;
}

/* ── Pivot function ───────────────────────────────────────── */
function pivotRecords(records) {
  const grouped = new Map();

  for (const r of records) {
    const key = `${r.state}|${r.city}|${r.station}|${r.last_update}`;

    if (!grouped.has(key)) {
      grouped.set(key, {
        latitude: Number(r.latitude) || null,
        longitude: Number(r.longitude) || null,
        source: "cpcb_datagov",
        recorded_at:
          `${r.last_update.slice(6, 10)}-${r.last_update.slice(3, 5)}-${r.last_update.slice(0, 2)}T${r.last_update.slice(11)}+05:30`,
        city: r.city || null,
        state: r.state || null,
        station: r.station || null,
        pm25: null, pm10: null, so2: null, no2: null, co: null, ozone: null, nh3: null
      });
    }

    const row = grouped.get(key);
    const val = Number(r.avg_value);
    if (isNaN(val)) continue;

    switch (r.pollutant_id.toUpperCase()) {
      case "PM2.5": row.pm25 = val; break;
      case "PM10":  row.pm10 = val; break;
      case "SO2":   row.so2  = val; break;
      case "NO2":   row.no2  = val; break;
      case "CO":    row.co   = val; break;
      case "OZONE": row.ozone = val; break;
      case "NH3":   row.nh3   = val; break;
    }
  }

  const allowed = ["pm25", "pm10", "so2", "no2", "co", "ozone", "nh3"];

  return Array.from(grouped.values())
    .filter(row => allowed.some(col => row[col] != null))
    .map(row => ({ ...row, aqi: computeAQI(row) }));
}

module.exports = { pivotRecords,computeAQI };
