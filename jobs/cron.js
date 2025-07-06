const cron = require('node-cron');
const runSatelliteJob = require('./satelliteCron');

// daily at 02:00
cron.schedule('0 2 * * *', () => {
  console.log('🛰️  Running daily Sentinel ingest…');
  runSatelliteJob();
});
