/**
 * A helper function to fetch keys from a running `live-keys` server.
 * 
 * How to use:
 * 1. Copy this function into a utility file in your own project (the "code-base").
 * 2. Ensure you have a fetch implementation (e.g., node-fetch for Node.js).
 * 3. Call this function with the name of the key you need.
 * 
 * Example:
 * const myApiKey = await getKey('MY_API_KEY');
 * if (myApiKey) {
 *   // Use the key
 * }
 */
async function getKey(keyName) {
  const port = 3666; // Ensure this matches your live-keys server port
  console.log(`[live-keys] Requesting key: '${keyName}'...`);

  try {
    const response = await fetch(`http://localhost:${port}/keys/${keyName}`);
    const data = await response.json();

    if (!data.value) {
      console.warn(`[live-keys] 🟡 WARNING: Key '${keyName}' was not found on the server. A null value was returned.`);
      return null;
    }

    // This is where the magic happens. We can infer the key type.
    const isPlaceholder = data.value.includes('placeholder');

    if (isPlaceholder) {
      console.log(`[live-keys] ✅ Success! Received a PLACEHOLDER key for '${keyName}'.`);
    } else {
      console.warn(`[live-keys] 🚨 DANGER! Received a REAL key for '${keyName}'. Ensure this is not visible on stream.`);
    }

    return data.value;

  } catch (error) {
    console.error(`[live-keys] ❌ CRITICAL: Could not connect to the live-keys server on port ${port}.`);
    console.error('[live-keys]   Please ensure the server is running with `npm run dev`.');
    return null;
  }
}

// Example usage:
// getKey('OPENAI_API_KEY').then(key => {
//   if (key) {
//     console.log('Key received:', key.substring(0, 15) + '...');
//   }
// }); 