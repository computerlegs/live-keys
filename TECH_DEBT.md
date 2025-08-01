# Technical Debt

This document tracks known issues, compromises, and areas for improvement in the codebase.

## 1. Hardcoded Default Credentials (RESOLVED)

-   **Location**: `src/config/index.ts`
-   **Issue**: The `MASTER_PASSWORD` and `JWT_SECRET` had hardcoded default values.
-   **Resolution**: The default values have been removed. The application will now fail to start if these environment variables are not provided, with a clear error message instructing the user to create a `.env` file. 