# Application Routes (`app`)

This directory implements the application's routing using the Next.js App Router. It defines the structure of the URLs and what UI is rendered for each route.

[**&laquo; Back to `src` README**](./README.md)

## Route Groups

The application uses route groups `(...)` to organize routes without affecting the URL path.

-   ### `(auth)` Group
    -   **Purpose:** Contains all routes related to authentication (login and signup).
    -   **Layout:** `(auth)/layout.tsx` provides a simple, centered layout for the authentication forms.
    -   **Routes:**
        -   `/login`: The login page.
        -   `/signup`: The registration page.

-   ### `(main)` Group
    -   **Purpose:** Contains all the core application routes that are accessible after a user is logged in.
    -   **Layout:** `(main)/layout.tsx` defines the main application shell, including the persistent sidebar and header. It also protects these routes, redirecting unauthenticated users to the login page.
    -   **Routes:**
        -   `/` (or `/general`): The main task pool page (`page.tsx`).
        -   `/daily`: The daily Kanban board.
        -   `/analytics`: The user's productivity analytics dashboard.
        -   `/settings`: The user settings page.

## Core Files

-   **`layout.tsx`**: The root layout for the entire application, which sets up the HTML structure, fonts, and global providers.
-   **`page.tsx`**: This file is inside the `(main)` group and serves as the homepage (`/`) of the authenticated experience, showing the General Task Pool.
-   **`actions.ts`**: A file for Next.js Server Actions, which allows client components to securely call server-side functions (like our AI categorization).
