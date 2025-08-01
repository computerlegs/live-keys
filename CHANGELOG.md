# Changelog

All notable changes to this project will be documented in this file.

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