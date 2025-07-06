// server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { startIngestionJob }= require('./jobs/ingestOpenAQ')
const app = express();
const PORT = process.env.PORT || 5000;
require('./jobs/cron');
require('./jobs/cron/sentinel_cron'); 
const locationRoute = require("./routes/location");
// app.use("/location", locationRoute);   // POST /location
const mapRoutes = require('./routes/map.routes')
// Middleware
app.use(cors());
// app.use(express.json());

// app.use(compression());
app.use(express.json());

// app.use('/api', aqi);
app.get('/', (_req, res) =>{
  res.json({ status: 'ok', time: new Date().toISOString() } ) ;
  console.log("og")

} )

app.use('/location', require("./routes/location"));   // <‑‑ path prefix

// Health check

// // Routes
app.use('/api/aqi', require('./routes/aqi'));

app.use('/maps',mapRoutes);

app.use((req, res, next) => {
  res.status(404).json({ error: 'Not Found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('🔥 Server Error:', err.stack || err);
  res.status(500).json({ error: 'Internal Server Error' });
});
// app.use('/api/forecast', require('./routes/forecast'));
// app.use('/api/recommendations', require('./routes/health'));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  startIngestionJob();
});


