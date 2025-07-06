async function getForecast(lat, lon) {
  // Replace later with real model or Open-Meteo forecast
  const now = new Date();
  const data = [];

  for (let i = 1; i <= 6; i++) {
    const future = new Date(now.getTime() + i * 60 * 60 * 1000);
    const pm2_5 = Math.floor(Math.random() * 100);
    data.push({
      time: future.toISOString(),
      pm2_5,
      aqi: pm2_5 <= 30 ? 50 : pm2_5 <= 60 ? 100 : pm2_5 <= 90 ? 200 : 300,
    });
  }

  return { location: { lat, lon }, forecast: data };
}

module.exports = { getForecast };
