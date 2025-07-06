const axios = require('axios');

exports.fetchAQIFromOpenAQ = async (lat, lon) => {

  const url = `https://api.openaq.org/v2/latest?coordinates=${lat},${lon}&radius=10000&limit=1`;

  const res = await axios.get(url);
  const locationData = res.data.results[0];

  const pollutants = {};
  locationData.measurements.forEach(measurement => {
    pollutants[measurement.parameter] = measurement.value;
  });

  return {
    location: locationData.location,
    city: locationData.city,
    aqi_estimate: Math.round(pollutants.pm25 || pollutants.pm10 || 0),
    pollutants
  };
};
