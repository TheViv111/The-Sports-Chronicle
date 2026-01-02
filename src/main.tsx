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

console.log("DEBUG: main.tsx executing");

const rootElement = document.getElementById("root");

if (rootElement) {
    console.log("DEBUG: Found root element, starting render");
    try {
        const root = createRoot(rootElement);
        root.render(
            <ErrorBoundary>
                <App />
            </ErrorBoundary>
        );
        console.log("DEBUG: Render call complete");
    } catch (e: any) {
        console.error("DEBUG: Fatal error during React render", e);
        rootElement.innerHTML = `
            <div style="padding: 20px; color: #e11; font-family: sans-serif; text-align: center;">
                <h1>Fatal Initialization Error</h1>
                <p>The application crashed during the initial React render.</p>
                <pre style="background: #f5f5f5; padding: 15px; text-align: left; overflow: auto; max-width: 600px; margin: 20px auto;">
                    ${e.message}\n${e.stack}
                </pre>
                <button onclick="location.reload(true)" style="padding: 10px 20px; background: #000; color: #fff; border: none; border-radius: 4px; cursor: pointer;">
                    Retry Reload
                </button>
            </div>
        `;
    }
} else {
    console.error("Root element not found");
}

