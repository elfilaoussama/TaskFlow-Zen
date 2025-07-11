# Application Routes (`app`)

This directory implements the application's routing using the Next.js App Router. It defines the structure of URLs and what UI is rendered for each route.

[**&laquo; Back to `src` README**](./README.md)

## Route Groups

The application uses route groups `(...)` to organize routes without affecting the URL path. This is useful for separating different sections of the app, like authentication and the main application.

-   ### `(auth)` Group
    -   **Purpose:** Contains all routes related to authentication (login, signup, email verification).
    -   **Layout:** `(auth)/layout.tsx` provides a simple, centered layout for the authentication forms.
    -   **Routes:**
        -   `/login`: The login page.
        -   `/signup`: The registration page.
        -   `/verify-email`: The email verification prompt page.

-   ### `(main)` Group
    -   **Purpose:** Contains all the core application routes that are accessible after a user is authenticated.
    -   **Layout:** `(main)/layout.tsx` defines the main application shell, including the sidebar and header. It protects these routes by redirecting unauthenticated users to the login page.
    -   **Routes:**
        -   `/`: The main task pool page (`page.tsx`).
        -   `/daily`: The daily Kanban board.
        -   `/analytics`: The user's productivity analytics dashboard.
        -   `/settings`: The user settings page.

## Core Files

-   **`layout.tsx`**: The root layout for the entire application. It sets up the HTML structure, fonts, SEO metadata, and global providers.
-   **`actions.ts`**: Contains Next.js Server Actions, which allow client components to securely call server-side functions (like our AI categorization flow).
