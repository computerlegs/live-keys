# Changelog

All notable changes to this project will be documented in this file.

## [1.1.1] - 2023-10-27

### Changed
- **Improved Stability:** Fixed a critical TypeScript bug that caused the server to crash on startup.
- **Enhanced Configuration:** Separated dynamic state (`.securestream.state.json`) from static configuration (`keys.json`), making the architecture more robust.
- **Refined UX:** Changed the default port to `3666` to avoid common conflicts and added comments to template files to make them self-documenting.

## [1.1.0] - 2023-10-27

### Added
- **Live Status Command (`status`):** A new command (`npm run status` or `npx status`) was added to connect to the live server and provide a real-time report of its status, mode, and recent key request history.
- **Configurable Strict Mode:** A `strictMode` option was added to `securestream.config.json`. When enabled, the API will return a hard `404 Not Found` for missing keys, helping to catch typos during development.
- **End-to-End Testing Guide:** The `README.md` was updated with a simple strategy and code examples for performing an end-to-end test of the entire workflow.

### Changed
- **Separated State from Config:** The application was refactored to store dynamic state (like `streamingMode`) in a `.securestream.state.json` file. This makes `keys.json` a true static configuration file and improves architectural robustness.
- **Upgraded Key Status Report:** The `check-keys` command was upgraded to generate a comprehensive, formatted table-based report, showing key status and non-sensitive snippets for better readability.
- **Rebranded Project:** The project was officially renamed to `live-keys` in `package.json` and all user-facing documentation for a consistent brand identity.
- **Enhanced Diagnostic Logging:** The `[DEBUG - REAL KEY]` log was made more explicit about its purpose as a diagnostic breadcrumb for debugging authentication errors.
- **Improved `README.md`:** The documentation was updated with a `husky` troubleshooting guide and polished to reflect all new features and the project's refined identity.

## [1.0.0] - 2023-10-27

### Added
- **Persistent Key Request Logging**: The server now maintains a `key-request-log.json` file, storing a timestamped history of the last 15 key requests for enhanced debugging.
- **Enhanced Health Endpoint**: The `GET /health` endpoint now returns the recent key request history.
- **Comprehensive Startup Banner**: The server now displays a detailed startup message outlining key files, commands, and server status for better discoverability.
- **`check-keys` Command**: Added a diagnostic script (`npm run check-keys` or `npx check-keys`) to validate key configuration.
- **Pre-Commit Git Hook**: Added an optional git hook to scan for real keys before committing, configured via `securestream.config.json`.
- **Feature Suggestions**: Captured more complex ideas in `FEATURE_SUGGESTIONS.md`.

### Changed
- **Pivoted to Lean MVP**: Refactored the entire application from a complex, database-driven architecture to a simple, file-based MVP.
- **Improved Error Handling**: Startup errors are more verbose, and API responses for missing keys are more graceful (200 OK with a null value).
- **Refined Logging**: Added more verbose, emoji-heavy logs for server status, mode changes, and real key access to improve visibility.

### Removed
- **Removed React UI**: The entire frontend, including Vite, React, and all related dependencies, was removed to focus on the core server functionality.
- **Removed Database**: Replaced the SQLite database, encryption services, and all related logic with a simple `keys.json` file.
- **Removed User Authentication**: The concept of user accounts and JWTs was eliminated as it was over-engineering for a localhost tool. 