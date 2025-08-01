#!/usr/bin/env node

const http = require('http');
const fs = require('fs');
const path = require('path');

const keysConfigPath = path.join(process.cwd(), 'keys.json');
let keysConfig = {};
try {
  const keysData = fs.readFileSync(keysConfigPath, 'utf-8');
  keysConfig = JSON.parse(keysData);
} catch (err) {
  console.error(`⚠️ Could not load keys.json. Placeholders will not be shown.`);
}

const options = {
  hostname: 'localhost',
  port: 3666,
  path: '/health',
  method: 'GET',
  timeout: 2000,
};

const req = http.request(options, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    if (res.statusCode !== 200) {
      console.error(`❌ Error: Server responded with status ${res.statusCode}.`);
      return;
    }
    const status = JSON.parse(data);
    
    console.log('\n--- ✅ live-keys Server Status ---');
    
    if (status.streamingMode) {
      console.log('   Mode: ON (Serving placeholder keys)');
    } else {
      console.log('   Mode: OFF (🚨 SERVING REAL KEYS!)');
    }

    console.log('\n--- Recent Key Request History ---\n');
    if (status.keyRequestHistory && status.keyRequestHistory.length > 0) {
      console.log('   Time       | Key Name               | Status      | Served           | Placeholder');
      console.log('   ---------- | ---------------------- | ----------- | ---------------- | ----------------');
      status.keyRequestHistory.forEach(entry => {
        const time = new Date(entry.timestamp).toLocaleTimeString();
        const keyName = (entry.keyName || 'N/A').padEnd(22);
        const mode = (entry.mode || 'Legacy').padEnd(11);
        const served = (entry.keyType === 'real' ? '🚨 REAL KEY' : '✅ Placeholder').padEnd(16);
        const placeholder = keysConfig.keys?.[entry.keyName]?.placeholder || 'N/A';
        console.log(`   ${time} | ${keyName} | ${mode} | ${served} | ${placeholder}`);
      });

      console.log('\n   Debugging Tips:');
      console.log("   - If your app fails with a 401 Unauthorized and you see 'Served: ✅ Placeholder',");
      console.log("     you may have forgotten to turn streaming mode off (`npm run stream:off`).");
      console.log("   - If your app fails and you see 'Served: 🚨 REAL KEY', the problem is likely with the key");
      console.log("     itself (e.g., it's expired, invalid, or has incorrect permissions).");

    } else {
      console.log('   (No key requests have been logged yet)');
    }

    if (!status.streamingMode) {
      console.log('\n   ⚠️ Did you remember to turn streaming mode on? (`npm run stream:on`)');
    }

    console.log('\n---------------------------------\n');
  });
});

req.on('error', (err) => {
  console.error('\n❌ Error: Could not connect to live-keys server.');
  console.error('   Please ensure the server is running with `npm run dev`.\n');
});

req.on('timeout', () => {
  req.destroy();
  console.error('\n❌ Error: Connection timed out.\n');
});

req.end(); 