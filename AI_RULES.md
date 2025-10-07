# AI Rules for The Sports Chronicle Application

This document outlines the core technologies used in this project and provides clear guidelines for using specific libraries and frameworks. Adhering to these rules ensures consistency, maintainability, and leverages the strengths of our chosen tech stack.

## Tech Stack Overview

*   **React**: The primary library for building interactive user interfaces.
*   **TypeScript**: Used for type safety across the entire codebase, enhancing code quality and developer experience.
*   **Vite**: The build tool, chosen for its fast development server and optimized build processes.
*   **Tailwind CSS**: A utility-first CSS framework for rapid and consistent styling, ensuring responsive designs.
*   **shadcn/ui**: A collection of beautifully designed, accessible, and customizable UI components built on Radix UI and Tailwind CSS.
*   **React Router**: Manages client-side routing, enabling seamless navigation between different pages of the application.
*   **Supabase**: Provides backend services including a PostgreSQL database, authentication, and edge functions for serverless logic.
*   **Tanstack Query (React Query)**: Handles server state management, data fetching, caching, and synchronization, improving performance and developer ergonomics.
*   **Lucide React**: A library providing a comprehensive set of customizable SVG icons for the application.
*   **`react-hook-form` with `zod`**: Used together for robust and efficient form management and validation.
*   **`sonner`**: A modern toast notification library for displaying user feedback.

## Library Usage Rules

To maintain a consistent and efficient codebase, please follow these guidelines when implementing new features or modifying existing ones:

*   **UI Components**: Always prioritize `shadcn/ui` components for all user interface elements. If a specific component is not available, create a new, small, and focused component using Radix UI primitives and Tailwind CSS, adhering to the existing `shadcn/ui` styling conventions.
*   **Styling**: All styling must be implemented using Tailwind CSS utility classes. Avoid custom CSS files or inline styles unless absolutely necessary for global styles (e.g., `src/index.css`).
*   **Routing**: Use `react-router-dom` for all navigation within the application. Define routes in `src/App.tsx`.
*   **Server State Management**: For fetching, caching, and updating server data, use `Tanstack Query`. This includes data from Supabase or any other API.
*   **Icons**: Integrate icons using the `lucide-react` library.
*   **Forms and Validation**: Implement forms using `react-hook-form` for state management and `zod` for schema-based validation.
*   **Backend Interactions**: All interactions with the database, authentication, and edge functions should be performed using the `supabase` client (`src/integrations/supabase/client.ts`).
*   **Notifications**: For displaying toast notifications to the user, use the `sonner` library.
*   **Internationalization (i18n)**: Utilize the custom `TranslationContext` and `useTranslation` hook (`src/contexts/TranslationContext.tsx`) for all text translations.
*   **Theming**: Use the `ThemeProvider` and `useTheme` hook (`src/components/ThemeProvider.tsx`) for managing dark/light mode functionality.