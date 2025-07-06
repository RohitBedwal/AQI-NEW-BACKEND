// services/openaq.js
const fetch = (...a) => import('node-fetch').then(({ default: f }) => f(...a));

/**
 * Get live AQ data near a lat/lon using OpenAQ v3.
 * Returns `null` if no station within the given radius.
 */
async function getAQIData(
  { lat, lon, radius = 5000, apiKey = process.env.OPENAQ_API_KEY } = {}
) {
  if (!Number.isFinite(lat) || !Number.isFinite(lon))
    throw new TypeError('lat and lon must be finite numbers');
  if (!apiKey)
    throw new Error('OpenAQ API key missing (set OPENAQ_API_KEY env var)');

  /* ---------- 1. find nearest location ---------- */
  const locURL =
    'https://api.openaq.org/v3/locations?' +
    new URLSearchParams({
      coordinates: `${lat},${lon}`,
      radius: String(radius),
      limit: '1',
    });

  const locRes = await fetch(locURL, { headers: { 'X-API-Key': apiKey } });
  if (!locRes.ok)
    throw new Error(
      `OpenAQ locations query failed (${locRes.status}) – ${locRes.statusText}`
    );
  const locJson = await locRes.json();
  if (!locJson?.results?.length) return null; // nothing nearby

  const location = locJson.results[0];

  /* ---------- 2. get that location’s latest measurements ---------- */
  const latestURL = `https://api.openaq.org/v3/locations/${location.id}/latest`;
  const latestRes = await fetch(latestURL, {
    headers: { 'X-API-Key': apiKey },
  });
  if (!latestRes.ok)
    throw new Error(
      `OpenAQ latest query failed (${latestRes.status}) – ${latestRes.statusText}`
    );
  const latestJson = await latestRes.json();

  return {
    location: location.name,
    city: location.locality,
    country: location.country?.code,
    measurements: latestJson.results, // array of {parameter,value,datetime,…}
    coordinates: location.coordinates,
    fetched_at: new Date().toISOString(),
    location_id: location.id,
    distance_m: location.distance,
  };
}

module.exports = { getAQIData };
