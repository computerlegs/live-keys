// test-app/fake-api.js
const http = require('http');
const REAL_API_KEY = 'sk-real-openai-key-goes-here'; // Must match keys.json

http.createServer((req, res) => {
  if (req.headers['authorization'] === `Bearer ${REAL_API_KEY}`) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: '✅ Success! Your API call worked.' }));
  } else {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: '❌ Unauthorized. Invalid key received.' }));
  }
}).listen(4001, () => console.log('Fake API listening on http://localhost:4001')); 