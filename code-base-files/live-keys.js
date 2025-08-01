/**
 * live-keys Client Helper v1.2
 * 
 * Drop this file into your project to interact with a running live-keys server
 * directly from your application's code.
 */
const PORT = 3666;
const BASE_URL = `http://localhost:${PORT}`;

/**
 * A generic, safe wrapper for calling the live-keys API.
 */
async function callApi(endpoint, options = {}) {
  try {
    const response = await fetch(`${BASE_URL}/${endpoint}`, options);
    if (!response.ok) {
      console.error(`[live-keys] ❌ Error: API call to '${endpoint}' failed with status ${response.status}.`);
      return null;
    }
    return response.json();
  } catch (error) {
    console.error(`[live-keys] ❌ CRITICAL: Could not connect to the live-keys server on port ${PORT}.`);
    console.error('[live-keys]   Please ensure the server is running with `npm run dev`.');
    return null;
  }
}

/**
 * Fetches a single key from the live-keys server.
 * Provides verbose console output about the key type received.
 */
async function getKey(keyName) {
  console.log(`[live-keys] Requesting key: '${keyName}'...`);
  const data = await callApi(`keys/${keyName}`);
  if (!data) return null;

  if (!data.value) {
    console.warn(`[live-keys] 🟡 WARNING: Key '${keyName}' was not found. A null value was returned.`);
    return null;
  }

  const isPlaceholder = data.value.includes('placeholder');
  if (isPlaceholder) {
    console.log(`[live-keys] ✅ Success! Received a PLACEHOLDER key for '${keyName}'.`);
  } else {
    console.warn(`[live-keys] 🚨 DANGER! Received a REAL key for '${keyName}'. Ensure this is not visible on stream.`);
  }
  return data.value;
}

/**
 * Fetches the live status from the server and prints a formatted report.
 */
async function getLiveStatus() {
  const status = await callApi('health');
  if (!status) return;

  console.log('\n--- ✅ live-keys Server Status ---');
  console.log(`   Mode: ${status.streamingMode ? 'ON (Placeholders)' : 'OFF (🚨 REAL KEYS!)'}`);
  console.log('\n--- Recent Key Request History ---');
  if (status.keyRequestHistory?.length > 0) {
    status.keyRequestHistory.forEach(entry => {
      const time = new Date(entry.timestamp).toLocaleTimeString();
      const served = entry.keyType === 'real' ? '🚨 REAL KEY' : '✅ Placeholder';
      console.log(`   [${time}] Requested '${entry.keyName}' | Served: ${served}`);
    });
  } else {
    console.log('   (No key requests logged yet)');
  }
  console.log('---------------------------------\n');
}

/**
 * Fetches the static key configuration report from the server.
 */
async function checkKeyConfig() {
    const report = await callApi('config-check');
    if (!report) return;

    console.log('\n--- 🕵️ live-keys Config Report ---');
    console.log(`   📊 ${report.established} of ${report.total} keys established.\n`);
    console.log('   Key Name               | Status');
    console.log('   ---------------------- | -----------');
    report.keys.forEach(k => {
        const status = k.isEstablished ? '✅ Established' : '🟡 Template';
        console.log(`   ${k.name.padEnd(22)} | ${status}`);
    });
    console.log('---------------------------------\n');
}

/**
 * Sets the streaming mode on the server.
 */
async function setStreamingMode(mode) { // mode can be 'on' or 'off'
    const response = await callApi('stream-mode/toggle', {
        method: 'POST',
        body: JSON.stringify({ mode }),
        headers: { 'Content-Type': 'application/json' }
    });
    if (!response) return;

    if (response.streamingMode) {
        console.log('[live-keys] ✅ Streaming Mode is now ON.');
    } else {
        console.log('[live-keys] 🚨 Streaming Mode is now OFF. REAL KEYS ARE LIVE.');
    }
}

module.exports = {
    getKey,
    getLiveStatus,
    checkKeyConfig,
    setStreamingMode,
}; 