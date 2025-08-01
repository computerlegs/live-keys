# SecureStream Key Server 🔐 (MVP)

A minimalist, localhost-only API key management server for live coding streams. This server reads from a simple `keys.json` file to serve real or placeholder API keys, helping you keep your credentials safe on stream.

## Why This Exists (The MVP Philosophy)

-   ✅ **Keep Keys Secure**: Runs only on localhost, inaccessible to viewers.
-   ✅ **Simple File-Based Config**: No database, no complex UI. Just edit `keys.json`.
-   ✅ **Zero Dependencies (Almost)**: Built with vanilla Node.js and Express to be lightweight.
-   ✅ **One-Command Mode Toggle**: A single API call switches between serving real and placeholder keys.

## Quick Start

### 1. One-Command Setup
```bash
npm install
```
This will install dependencies and automatically create a `keys.json` file from a template.

### 2. Configure Your Keys
Open the newly created `keys.json` file and add your real and placeholder API keys.

### 3. Run the Server
```bash
# Development mode (auto-reloads on file changes)
npm run dev
```
The server will start, and you'll see a status message in your terminal confirming it's running.

## API Endpoints

### `GET /health`
A simple health check to see if the server is running and what mode it's in.
-   **Response**: `{ "status": "ok", "streamingMode": false }`

### `POST /stream-mode/toggle`
Toggles between serving real keys and placeholder keys. This action writes to `keys.json`.
-   **Response**: `{ "streamingMode": true }`

### `GET /keys/:name`
Retrieves a key.
-   **Example**: `GET http://localhost:3001/keys/OPENAI_API_KEY`
-   **Response**: `{ "key": "OPENAI_API_KEY", "value": "..." }` (The value will be the real or placeholder key depending on the current mode). 