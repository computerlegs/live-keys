// test-app/run-test.js
async function runTest() {
  console.log('--- Running Test ---');
  // 1. Fetch key from live-keys server
  const liveKeysResponse = await fetch('http://localhost:3001/keys/OPENAI_API_KEY');
  const { value: apiKey } = await liveKeysResponse.json();
  console.log(`Received key from live-keys: ${apiKey ? `"${apiKey.substring(0, 15)}..."` : 'null'}`);

  // 2. Use the key to call the fake API
  const apiResponse = await fetch('http://localhost:4001', {
    headers: { 'Authorization': `Bearer ${apiKey}` }
  });
  const result = await apiResponse.json();
  console.log(`Result from Fake API: ${result.message}\n`);
}

runTest(); 