# Library & Utilities (`lib`)

This directory contains shared code, configuration, and type definitions that are used across the application. It serves as a central place for foundational logic.

[**&laquo; Back to `src` README**](./README.md)

## Files

-   **`firebase.ts`**: Initializes and exports the Firebase app instance, along with the Auth and Firestore services. It includes a check to ensure that the required environment variables are configured.

-   **`priority.ts`**: Contains the `calculatePriorityScore` function, a pure function that calculates a numerical priority score for a task based on its attributes (urgency, importance, deadline) and the user's configured weights.

-   **`types.ts`**: Defines all the core TypeScript types and interfaces used throughout the application, such as `Task`, `Settings`, `Category`, and `Notification`. This ensures data consistency.

-   **`utils.ts`**: A collection of general-purpose utility functions. It currently contains the `cn` function, which merges Tailwind CSS classes safely and efficiently.
