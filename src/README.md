# Source Code (`src`)

This directory is the heart of the Tassko application, containing all the source code. The structure is organized by feature and concern to make the codebase maintainable and scalable.

[**&laquo; Back to Root README**](../README.md)

## Directory Breakdown

-   [**`app/`**](./app/README.md): Contains all the routes, pages, and layouts of the application, following the Next.js App Router conventions. This is where the user interface is defined.

-   [**`components/`**](./components/README.md): Holds all the reusable React components used throughout the application. This includes both custom components and UI primitives from ShadCN.

-   [**`contexts/`**](./contexts/README.md): Contains React Context providers that manage global state, such as user authentication, tasks, and notifications.

-   [**`ai/`**](./ai/README.md): Home to all Generative AI functionality, powered by Firebase Genkit. This includes AI flows for features like task categorization.

-   [**`hooks/`**](./hooks): Contains custom React hooks that encapsulate reusable logic, such as `useSound` for audio feedback or `use-toast` for notifications.

-   [**`lib/`**](./lib/README.md): A collection of library code, utility functions, type definitions, and the main Firebase configuration.
