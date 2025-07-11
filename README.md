# Tassko: Your AI-Powered Daily Planner & Kanban Productivity App

Welcome to Tassko, a modern, AI-powered task management application built with Next.js, Firebase, and Genkit. Tassko provides a dynamic, time-based Kanban interface to help you organize your day, boost productivity with AI prioritization, and analyze your progress.

[**Explore the Codebase Structure &raquo;**](./src/README.md)

## Features

-   **Dual-Board System:** Manage a general task pool and a focused daily Kanban board.
-   **AI Task Manager:** Automatically categorize tasks into Morning, Midday, or Evening swimlanes using our AI planner.
-   **Dynamic Prioritization:** Tasks are automatically scored based on urgency, importance, impact, and deadlines to help you focus on what matters.
-   **Rich Task Details:** Add descriptions, deadlines, attachments (images/PDFs), and more to your to-do list with AI.
-   **Productivity Analytics:** Visualize your progress with charts and graphs.
-   **Firebase Integration:** Secure authentication and real-time data persistence with Firestore.
-   **Responsive Design:** Fully functional on both desktop and mobile devices.

## Tech Stack

-   **Framework:** [Next.js](https://nextjs.org/) (with App Router)
-   **Language:** [TypeScript](https://www.typescriptlang.org/)
-   **Styling:** [Tailwind CSS](https://tailwindcss.com/) & [ShadCN UI](https://ui.shadcn.com/)
-   **Generative AI:** [Firebase Genkit](https://firebase.google.com/docs/genkit)
-   **Backend & Database:** [Firebase Authentication & Firestore](https://firebase.google.com/)
-   **Deployment:** [Firebase App Hosting](https://firebase.google.com/docs/app-hosting)

## Getting Started

### Prerequisites

-   Node.js (v18 or later)
-   A Firebase project.

### 1. Setup Environment Variables

First, create a `.env` file in the root of the project and populate it with your Firebase project credentials. You can find these in your Firebase project console settings.

```bash
cp .env.example .env
```

Then, fill in the values in `.env`:

```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

### 2. Install Dependencies

Install the project dependencies using npm:

```bash
npm install
```

### 3. Run the Development Server

Start the Next.js development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deployment

This application is configured for easy deployment using [Firebase App Hosting](https://firebase.google.com/docs/app-hosting), a fully-managed, serverless hosting service for web applications.

1.  **Connect to GitHub:** Go to the Firebase App Hosting section of your Firebase console.
2.  **Create a Backend:** Follow the prompts to connect your GitHub repository.
3.  **Automatic Deployments:** Once connected, App Hosting will automatically build and deploy your application on every push to the `main` branch. It will also create temporary preview URLs for every pull request.

The `apphosting.yaml` file in the root of the project contains the configuration for the App Hosting build.

## Project Structure

For a detailed explanation of the project's folder structure and architecture, please refer to the [**Source Code README**](./src/README.md).
