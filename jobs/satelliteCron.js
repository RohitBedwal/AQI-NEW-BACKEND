// jobs/satelliteCron.js
const { spawn } = require('child_process');
const path = require('path');

module.exports = () => {
  const scriptPath = path.join(__dirname, 'python', 'sentinel_ingest.py');

  const child = spawn('python', [scriptPath], {
    stdio: 'inherit',         // stream Python logs directly
    env: process.env          // pass all .env variables
  });

  child.on('error', (err) => console.error('❌ Python spawn error:', err));
  child.on('exit', (code) =>
    console.log(code === 0 ? '✅ Satellite ingest done' : `❌ Python exited code ${code}`)
  );
};
