// jobs/cron/sentinel_cron.js

const runSatelliteJob = require('../satelliteCron');

(async () => {
  console.log('🛰️ Manually triggering Sentinel ingest…');
  await runSatelliteJob(); // this runs your satellite ingestion logic
})();

