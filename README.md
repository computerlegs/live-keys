# "live-keys" by Josh Reinhardt v1.1

*Designed to make building in public easier*

`live-keys` is a lightweight Express-based tool that helps you build in public safely. It runs as a separate local server, acting as a simple proxy for your API keys. This allows you to follow your normal development workflow while obfuscating your real credentials from a `keys.json` file, preventing them from being exposed during live streams, videos, or presentations.

```mermaid
graph TD
    A["Your App"] -- "1. Asks for 'API_KEY'" --> B["live-keys Server"];
    B -- "2. Reads mode from 'keys.json'" --> C["keys.json"];
    B -- "3. Returns value" --> A;
    A -- "4. Uses value to call API" --> D["External Service"];
```

## When to Use This Tool
You should use this tool **any time your screen, terminal, or browser's developer tools might be visible to others.** This includes live streams, recorded videos, pair programming sessions with external collaborators, or any situation where you are sharing your development environment publicly.

## Target Audience
*   **Live Coding Streamers and YouTubers:** The primary audience, who can code with real APIs without fear of accidental exposure.
*   **Developers Building in Public, Presentations and at Demos:** Anyone giving a live talk or demo.
*   **Open-Source Developers:** Anyone recording a GIF, streaming a feature build, or sharing their screen.
*   **Educators and Tutorial Creators:** Teachers demonstrating authentic, end-to-end development workflows.

---
## Core Features
-   **Local Key Server**: A simple Express server to fetch your keys.
-   **Streaming Mode Toggle**: Instantly switch between serving real keys (dev mode) and placeholder keys (stream mode).
-   **Configurable Strict Mode**: Choose whether the server returns a hard `404 Not Found` error or a friendly `null` value for missing keys, preventing silent failures during development.
-   **Pre-Commit Git Hook**: Optional hook to prevent you from accidentally committing real keys.
-   **Request History Log**: A persistent log of the last 15 key requests for easy debugging.

## Installation & Setup

### 1. Install via npm
```bash
npm install
```
This command installs dependencies and creates `keys.json` and `securestream.config.json` files from templates.

### 2. Configure Your Keys & Features
-   **`keys.json`**: Add your real and placeholder API keys.
-   **`securestream.config.json`**: Enable or disable features like `strictMode` and the `gitHook`.

### 3. Set Up the Git Hook (Optional, but Recommended)
We recommend using `husky` to manage the git hooks reliably.
```bash
npm install husky --save-dev
npx husky install
npx husky add .husky/pre-commit "node scripts/pre-commit.js"
```

## Running the Server
```bash
npm run dev
```

## Diagnostic Commands
-   `npm run status`: Shows the live status of the running server.
-   `npm run check-keys`: Validates your `keys.json` configuration.

## Testing Your Setup

You can perform a simple end-to-end test to validate the entire workflow. Create a `test-app` directory with two files:

**1. `fake-api.js` (A mock of a real API)**
```javascript
const http = require('http');
// This key must match a 'real' key in your keys.json
const REAL_API_KEY = 'sk-real-openai-key-goes-here'; 

http.createServer((req, res) => {
  if (req.headers['authorization'] === `Bearer ${REAL_API_KEY}`) {
    res.writeHead(200, {'Content-Type': 'application/json'}).end(JSON.stringify({ message: '✅ Success!' }));
  } else {
    res.writeHead(401, {'Content-Type': 'application/json'}).end(JSON.stringify({ message: '❌ Unauthorized' }));
  }
}).listen(4001, () => console.log('Fake API listening on http://localhost:4001'));
```

**2. `run-test.js` (A script that simulates your app)**
```javascript
async function runTest() {
  const res = await fetch('http://localhost:3001/keys/OPENAI_API_KEY');
  const { value: apiKey } = await res.json();
  const apiRes = await fetch('http://localhost:4001', { headers: { 'Authorization': `Bearer ${apiKey}` } });
  console.log(`Fake API responded with: ${await apiRes.text()}`);
}
runTest();
```
Run `node test-app/fake-api.js` and `npm run dev` in separate terminals. Then run `node test-app/run-test.js`. Toggle streaming mode on and off to see the test succeed and fail.
