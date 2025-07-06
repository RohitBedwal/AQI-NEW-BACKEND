const axios = require("axios");
// const { response } = require('../app');

module.exports.getMapCoordinates = async (address) => {
  const apiKey = process.env.GOOGLE_MAP_API;
  const url = 'https://maps.googleapis.com/maps/api/geocode/json';

  try {
    const { data } = await axios.get(url, {
      params: { address, key: apiKey },
    });
    console.log('[getMapCoordinates] raw response →', data.status);

    if (data.status === 'OK' && data.results.length) {
      const { lat, lng } = data.results[0].geometry.location;
      return { lat, lng }; // ✅ proper keys
    }
    throw new Error('Unable to fetch coordinates');
  } catch (err) {
    console.error('[getMapCoordinates] Error:', err.message);
    throw err;
  }
};

module.exports.getTheDistanceTime = async (origin, destination) => {
  if (!origin || !destination) {
    throw new Error("Please mention both origin and destination");
  }

  const apiKey = process.env.GOOGLE_MAP_API;
  console.log();
  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(
    origin
  )}&destinations=${encodeURIComponent(destination)}&key=${apiKey}`;

  const response = await axios.get(url);
  const data = response.data;
  // console.log(response)
  try {
    if (data.status === "OK") {
      const element = data.rows[0]?.elements[0];

      if (!element || element.status === "ZERO_RESULTS") {
        throw new Error("No results found for the given locations.");
      }

      return {
        distance: element.distance.text,
        duration: element.duration.text,
        distanceValue: element.distance.value, // in meters
        durationValue: element.duration.value, // in seconds
      };
    } else {
      throw new Error(
        "Unable to get distance or time from API: " + data.status
      );
    }
  } catch (error) {
    console.error("API Error:", error.message);
    throw error;
  }
};

module.exports.getAutoCompleteSuggestion = async (input) => {
  if (!input) {
    throw new Error("Query is required");
  }

  const apiKey = process.env.GOOGLE_MAP_API;
  if (!apiKey) {
    throw new Error("API key is missing");
  }
  console.log(input, apiKey);
  const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
    input
  )}&key=${apiKey}`;

  try {
    const response = await axios.get(url);
    console.log(response.data);
    if (response.data.status === "OK") {
      return {
        predictions: response.data.predictions,
      };
    } else {
      throw new Error(`Google API Error: ${response.data.status}`);
    }
  } catch (error) {
    console.error("Google API request failed:", error.message);
    throw error;
  }
};
