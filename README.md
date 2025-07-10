
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

This application is configured for deployment using [Firebase App Hosting](https://firebase.google.com/docs/app-hosting), a fully-managed, serverless hosting service for web applications.

### To Deploy Your App:

1.  **Connect to GitHub:** Go to the Firebase App Hosting section of your Firebase console.
2.  **Create a Backend:** Click "Create backend" and follow the prompts to connect your GitHub repository.
3.  **Automatic Deployments:** Once connected, App Hosting will automatically build and deploy your application.
    -   Every `push` to the `main` branch will update your live site.
    -   Every pull request will generate a temporary preview URL.

The `apphosting.yaml` file in the root of the project contains the configuration for the App Hosting build. The existing `.github/workflows` files are for a legacy deployment method and are not used by App Hosting.

## Customization

### Email Templates

To provide a professional user experience, you can customize the emails Firebase sends for actions like password resets.

1.  Go to the **Firebase Console**.
2.  Navigate to **Authentication** > **Templates**.
3.  Select the **Password reset** template.
4.  Click the pencil icon to edit it.
5.  Customize the **Subject** and **Message**. You can use the following professional template:

    **Subject:**
    ```
    Reset Your Tassko Password
    ```

    **Message:**
    ```
    Hi %DISPLAY_NAME%,

    We received a request to reset the password for your Tassko account.

    If you made this request, click the link below to reset your password:

    %LINK%

    If you didn’t request a password reset, please ignore this email. Your account will remain secure.

    If you need help, feel free to reach out to our support team.

    Thanks,
    The Tassko Team
    ```
6.  Click **Save**.

## Project Structure

For a detailed explanation of the project's folder structure and architecture, please refer to the [**Source Code README**](./src/README.md).
