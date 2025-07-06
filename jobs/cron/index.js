// in jobs/cron/index.js
const ingestCAMS = require('../ingestCAMS');

cron.schedule('*/15 * * * *', async () => {
  await ingestCPCB(); // CPCB first
  await ingestCAMS(28.6139, 77.2090); // Delhi example
});
