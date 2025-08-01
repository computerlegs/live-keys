# live-keys Client Helper

This directory contains a small, self-contained JavaScript library (`live-keys.js`) that you can drop into your own project (the "code-base") to interact with the `live-keys` server programmatically.

## Why Use This?

Instead of switching to your terminal to run `npm run status` or `npm run stream:on`, you can call these functions directly from your application's code. This allows you to build diagnostic checks and controls right into your primary development workflow.

## Quick Setup

1.  **Copy this directory (`/code-base-files`)** into the root of your own project.
2.  **Require the library** where you need it.

```javascript
// In your application's main file (e.g., index.js)
const { getKey, getLiveStatus, checkKeyConfig, setStreamingMode } = require('./code-base-files/live-keys');

// Now you can use the functions!
async function main() {
  await getLiveStatus();
  
  await setStreamingMode('on');
  const apiKey = await getKey('MY_API_KEY');
  
  await setStreamingMode('off');
}

main();
```

## Available Functions

### `getKey(keyName)`
Fetches a single key. Provides verbose console output about whether a real or placeholder key was received.

### `getLiveStatus()`
Fetches the live status from the server and prints a formatted, human-readable report to your console.

### `checkKeyConfig()`
Fetches the static key configuration report from the server and prints a formatted table.

### `setStreamingMode(mode)`
Sets the streaming mode on the server. `mode` can be `'on'` or `'off'`. 