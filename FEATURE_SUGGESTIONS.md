# Future Feature Suggestions

This document tracks proposals for more advanced features that are currently out of scope for the core v1 product but could be considered for future versions.

## 1. Terminal Output Filtering

-   **Concept**: A companion terminal wrapper (e.g., `secure-exec -- your-command`) that actively scans `stdout` and `stderr` streams in real-time. It would find and replace any key patterns found in `keys.json` before they are displayed in the terminal.
-   **Goal**: To catch the accidental exposure of secrets from any command-line tool, script output, or application log that prints directly to the console.
-   **Complexity**: High. This requires intercepting and modifying standard I/O streams, which can be complex and platform-dependent. It also changes the user's native workflow, requiring them to pipe commands through a wrapper, which could be a barrier to adoption.

## 2. Transparent Request Proxy

-   **Concept**: A lightweight proxy server that sits between the user's applications and external APIs. This proxy would automatically intercept outgoing HTTP/S requests, find any real keys in headers or URLs based on `keys.json`, and substitute them with placeholder values.
-   **Goal**: To prevent secrets from being visible in browser DevTools (Network tab) or other local network monitoring tools.
-   **Complexity**: Very High. This feature would require generating a local root Certificate Authority (CA), persuading the user's system and browsers to trust it, and then performing "man-in-the-middle" (MITM) interception of all TLS traffic. This is a significant technical and user-experience challenge. 