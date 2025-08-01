#!/usr/bin/env node

const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3666,
  path: '/health',
  method: 'GET',
  timeout: 2000, // 2-second timeout
};

const req = http.request(options, res => {
  let data = '';
  res.on('data', chunk => {
    data += chunk;
  });
  res.on('end', () => {
    if (res.statusCode !== 200) {
      console.error(`❌ Error: Server responded with status ${res.statusCode}. Is it starting up?`);
      return;
    }
    const status = JSON.parse(data);
    
    console.log('\n--- ✅ SecureStream Server Status ---\n');
    console.log(`   Server is connected and running.`);

    if (status.streamingMode) {
      console.log('   Streaming Mode: ON (Serving placeholder keys)');
    } else {
      console.log('   Streaming Mode: OFF (🚨 SERVING REAL KEYS!)');
    }

    console.log('\n--- Recent Key Request History ---\n');
    if (status.keyRequestHistory && status.keyRequestHistory.length > 0) {
      status.keyRequestHistory.forEach(entry => {
        const time = new Date(entry.timestamp).toLocaleTimeString();
        console.log(`   [${time}] Requested key: '${entry.keyName}'`);
      });
    } else {
      console.log('   (No key requests have been logged yet)');
    }
    console.log('\n------------------------------------\n');
  });
});

req.on('error', (err) => {
  console.error('\n❌ Error: Could not connect to SecureStream server.');
  console.error('   Please ensure the server is running with `npm run dev`.\n');
});

req.on('timeout', () => {
  req.destroy();
  console.error('\n❌ Error: Connection timed out. Is the server running correctly?\n');
});

req.end(); 