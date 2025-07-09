# Global State Management (`contexts`)

This directory houses the React Context providers responsible for managing the application's global state. Using contexts allows us to share state and logic across different components without "prop drilling."

[**&laquo; Back to `src` README**](./README.md)

## Contexts

-   ### `AuthContext.tsx`
    -   **Purpose:** Manages the current user's authentication state.
    -   **Responsibilities:**
        -   Listens for changes in Firebase Auth state.
        -   Provides the `user` object and a `isLoading` flag.
        -   Manages the logic for showing the one-time onboarding guide to new users.
    -   **Hook:** `useAuth()`

-   ### `TaskContext.tsx`
    -   **Purpose:** The main data store for the application. It manages all tasks and user settings.
    -   **Responsibilities:**
        -   Fetches, adds, updates, and deletes tasks from Firestore in real-time.
        -   Manages user-specific settings (categories, priority weights, etc.).
        -   Provides functions for core application logic, like moving tasks between boards or triggering AI categorization.
    -   **Hook:** `useTaskContext()`

-   ### `NotificationContext.tsx`
    -   **Purpose:** Manages the in-app notification system.
    -   **Responsibilities:**
        -   Stores a list of recent notifications.
        -   Tracks the number of unread notifications.
        -   Provides functions to add, read, and clear notifications.
    -   **Hook:** `useNotification()`
