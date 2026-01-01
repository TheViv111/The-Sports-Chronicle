import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import ErrorBoundary from "./components/common/ErrorBoundary";
import "./index.css";

// Catch unhandled promise rejections (often from failed initial data fetches)
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    // We don't necessarily want to crash the whole app for every rejection, 
    // but logging it helps debugging immensely.
});

const rootElement = document.getElementById("root");

if (rootElement) {
    createRoot(rootElement).render(
        <ErrorBoundary>
            <App />
        </ErrorBoundary>
    );
} else {
    console.error("Root element not found");
}

