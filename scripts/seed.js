// scripts/seed.js
const fs = require('fs');
const path = require('path');
const db = require('../services/db.js');

(async () => {
  try {
    // Resolve the file path relative to this script's directory
    const file = path.resolve(__dirname, '../dev/manualData.json');

    // Read and parse the JSON file
    const rows = JSON.parse(fs.readFileSync(file, 'utf8'));

    // Insert the data into the 'readings' table
    const { error } = await db.from('readings').insert(rows);

    if (error) throw error;

    console.log('✅ Seeded manual data');
  } catch (err) {
    console.error('❌ Seed failed:', err.message || err);
    process.exit(1); // Non-zero means error
  }
})();
