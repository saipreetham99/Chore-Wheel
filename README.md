# Chore Wheel

A simple, customizable chore wheel and task scheduler built with Next.js and ShadCN UI. This application provides a clean, user-friendly interface to manage and assign recurring tasks for your team, household, or any group. It's designed to be flexible, allowing for an unequal number of people and tasks, and ensures fair distribution over time.

![Chore Wheel Screenshot](https://github.com/saipreetham99/Chore-Wheel/blob/main/ui.jpeg)

## Features

- **Customizable Lists:** Easily add, edit, or remove team members and tasks.
- **Persistent Storage:** All changes are saved to your browser's local storage, so your setup is preserved.
- **Monthly Calendar View:** See the entire month's schedule at a glance, with a clear weekly breakdown.
- **Fair Task Distribution:** The scheduling logic handles any number of people and tasks, rotating assignments to ensure everyone shares the workload.
- **Responsive Design:** A clean, modern UI that works great on both desktop and mobile devices.
- **Static Site Ready:** Can be easily hosted for free on platforms like GitHub Pages, Vercel, or Netlify.

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (with App Router)
- **UI:** [React](https://react.dev/) & [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Components:** [ShadCN UI](https://ui.shadcn.com/)
- **Icons:** [Lucide React](https://lucide.dev/)

## Getting Started

To run the project locally, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/your-repo-name.git
    cd your-repo-name
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```

    Open [http://localhost:9002](http://localhost:9002) in your browser to see the application.

## Hosting

This application is configured for static export, making it easy to deploy for free.

1.  **Build for production:**
    ```bash
    npm run build
    ```
    This command generates a static version of the site in the `out` directory.

2.  **Deploy:**
    Upload the contents of the `out` directory to any static hosting provider. Some great options include:
    - [Vercel](https://vercel.com/)
    - [Netlify](https://www.netlify.com/)
    - [GitHub Pages](https://pages.github.com/)
    - [Firebase Hosting](https://firebase.google.com/docs/hosting)
