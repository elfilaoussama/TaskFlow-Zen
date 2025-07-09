# AI Flows (`flows`)

A Genkit "Flow" is a server-side function that orchestrates calls to language models, tools, and other services to perform a specific AI-driven task. Each file in this directory typically defines a single, exportable flow.

[**&laquo; Back to `ai` README**](./README.md)

## Flows

-   ### `categorize-task-into-swimlanes.ts`
    -   **Purpose:** This flow takes a task description as input and uses an LLM to determine the most appropriate time of day (Morning, Midday, or Evening) to complete it.
    -   **Functionality:**
        1.  Receives a task description.
        2.  Uses a structured prompt to ask the model to choose one of the three swimlanes.
        3.  Returns the chosen swimlane as a string.
    -   **Usage:** This flow is called from the main application via a Next.js Server Action (`src/app/actions.ts`) when the user clicks the "Categorize with AI" button on a task card.
