#!/usr/bin/env node

const http = require('http');

const mode = process.argv[2]; // 'on', 'off', or undefined for toggle

const postData = JSON.stringify({ mode });

const options = {
  hostname: 'localhost',
  port: 3666,
  path: '/stream-mode/toggle',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData),
  },
  timeout: 2000,
};

const req = http.request(options, res => {
  let data = '';
  res.on('data', chunk => {
    data += chunk;
  });
  res.on('end', () => {
    const { streamingMode } = JSON.parse(data);
    if (streamingMode) {
      console.log('✅ Streaming Mode is now ON. Placeholder keys will be served.');
    } else {
      console.log('🚨 Streaming Mode is now OFF. REAL KEYS WILL BE SERVED.');
    }
  });
});

req.on('error', (err) => {
  console.error('\n❌ Error: Could not connect to live-keys server.');
  console.error('   Please ensure the server is running with `npm run dev`.\n');
});

req.write(postData);
req.end(); 