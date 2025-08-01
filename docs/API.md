# live-keys API Documentation

This document outlines the HTTP API endpoints provided by the `live-keys` server.

## Base URL
`http://localhost:3666`

---

### `GET /health`
Returns a detailed snapshot of the server's current, live state.

-   **Method**: `GET`
-   **Success Response (200 OK)**:
    ```json
    {
      "status": "ok",
      "streamingMode": false,
      "keyRequestHistory": [
        {
          "timestamp": "2023-10-27T10:00:01.123Z",
          "keyName": "OPENAI_API_KEY",
          "mode": "Development",
          "keyType": "real"
        }
      ]
    }
    ```

---

### `POST /stream-mode/toggle`
Sets the streaming mode on the server.

-   **Method**: `POST`
-   **Body**:
    ```json
    {
      "mode": "on" 
    }
    ```
    *   `mode` (string, optional): Can be `"on"` or `"off"`. If omitted, the mode will be toggled from its current state.
-   **Success Response (200 OK)**:
    ```json
    {
      "streamingMode": true
    }
    ```

---

### `GET /config-check`
Performs a static analysis of the `keys.json` file and returns a report.

-   **Method**: `GET`
-   **Success Response (200 OK)**:
    ```json
    {
      "total": 3,
      "established": 2,
      "keys": [
        { "name": "OPENAI_API_KEY", "isEstablished": true },
        { "name": "STRIPE_KEY", "isEstablished": true },
        { "name": "NEW_KEY", "isEstablished": false }
      ]
    }
    ```

---

### `GET /keys/:name`
Retrieves a single key value.

-   **Method**: `GET`
-   **URL Params**:
    *   `name` (string, required): The name of the key to retrieve (e.g., `/keys/OPENAI_API_KEY`).
-   **Success Response (200 OK)**:
    ```json
    {
      "key": "OPENAI_API_KEY",
      "value": "sk-real-key-value-goes-here"
    }
    ```
-   **Not Found Response (Varies by `strictMode`)**:
    *   If `strictMode: false` (default), returns `200 OK`:
        ```json
        {
          "key": "INVALID_KEY",
          "value": null,
          "message": "Key 'INVALID_KEY' not found."
        }
        ```
    *   If `strictMode: true`, returns `404 Not Found`:
        ```json
        {
          "error": "Key 'INVALID_KEY' not found."
        }
        ``` 