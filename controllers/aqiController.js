const { fetchAQIFromOpenAQ } = require('../services/externalAPI');

exports.getAQIData = async (req, res) => {
  const { lat, lon } = req.query;
    console.log("og")

  if (!lat || !lon) {
    return res.status(400).json({ error: 'lat and lon are required' });
  }

  try {
    const aqiData = await fetchAQIFromOpenAQ(lat, lon);
    res.json(aqiData);
  } catch (error) {
    console.error('Error fetching AQI:', error.message);
    res.status(500).json({ error: 'Failed to fetch AQI' });
  }
};
