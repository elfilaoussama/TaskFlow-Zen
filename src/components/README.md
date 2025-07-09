# Reusable Components (`components`)

This directory contains all the React components that make up the Tassko user interface. Components are organized by feature or purpose.

[**&laquo; Back to `src` README**](./README.md)

## Directory Structure

-   ### `ui/`
    -   **Purpose:** Contains all the generic, unstyled UI components provided by [ShadCN UI](https://ui.shadcn.com/). These are the building blocks for our application's design system (e.g., `Button`, `Card`, `Dialog`). They are styled using Tailwind CSS and our theme variables in `globals.css`.

-   ### `auth/`
    -   **Purpose:** Components specifically used in the authentication flow, such as the Google Sign-In icon.

-   ### `general/`
    -   **Purpose:** Components for the "General Task Pool" page, like the main task list.

-   ### `kanban/`
    -   **Purpose:** Components for the core Kanban board experience, including `KanbanBoard`, `Swimlane`, `TaskCard`, and the `AddTaskDialog`.

-   ### `layout/`
    -   **Purpose:** High-level layout components that define the application's structure, such as `AppShell`, `UserNav`, and the `OnboardingGuide`.

-   ### `providers/`
    -   **Purpose:** The `AppProviders` component, which wraps the entire application with necessary context providers (Theme, Auth, Task, etc.).

-   ### `stats/`
    -   **Purpose:** Components used for displaying statistics, such as the `Dashboard` component in the sidebar.

-   **`TasskoLogo.tsx`**: A dedicated component for rendering the official Tassko application logo.
