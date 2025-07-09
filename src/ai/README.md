# Generative AI (`ai`)

This directory contains all the code related to Generative AI features, powered by [Firebase Genkit](https://firebase.google.com/docs/genkit).

[**&laquo; Back to `src` README**](./README.md)

## Structure

-   [**`flows/`**](./flows/README.md): Defines the multi-step AI workflows. Each flow coordinates prompts, tools, and other logic to accomplish a specific task.

-   **`genkit.ts`**: This is the core Genkit configuration file. It initializes the Genkit instance, configures plugins (like `googleAI`), and sets the default LLM to be used across the application.

-   **`dev.ts`**: A development-only file used by the Genkit CLI to start the Genkit development server and register all the defined flows.
