import { createRoot } from "react-dom/client";
import "./index.css";

// Catch unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
});

console.log("DEBUG: main.tsx executing");

/**
 * Bootstrap the application using dynamic imports to catch module-level crashes.
 * This is the only way to catch errors that occur during the initial parsing/import
 * phase of the component tree.
 */
async function bootstrap() {
    const rootElement = document.getElementById("root");
    if (!rootElement) {
        console.error("Root element not found");
        return;
    }

    console.log("DEBUG: Found root element, loading application components...");

    try {
        // Wrap module imports in a Promise.all to load concurrently but catch any failure
        console.log("DEBUG: Starting dynamic imports of App and ErrorBoundary...");

        // Use dynamic import() which returns a promise that rejects if the module fails to load or execute
        const [AppModule, ErrorBoundaryModule] = await Promise.all([
            import("./App.tsx"),
            import("./components/common/ErrorBoundary")
        ]);

        const App = AppModule.default;
        const ErrorBoundary = ErrorBoundaryModule.default;

        console.log("DEBUG: Modules loaded successfully, mounting React tree...");
        const root = createRoot(rootElement);
        root.render(
            <ErrorBoundary>
                <App />
            </ErrorBoundary>
        );
        console.log("DEBUG: React render initialization complete");
    } catch (e: any) {
        console.error("DEBUG: FATAL BOOTSTRAP ERROR DETECTED:", e);

        // Manual fallback UI in case ErrorBoundary failed to even load
        rootElement.innerHTML = `
            <div style="padding: 40px; color: #000; font-family: system-ui, -apple-system, sans-serif; text-align: center; max-width: 800px; margin: 0 auto;">
                <h1 style="color: #e11; font-size: 28px; margin-bottom: 10px;">⚠️ Application Failed to Load</h1>
                <p style="font-size: 18px; color: #444; margin-bottom: 30px;">
                    A critical error occurred while preparing the application modules.
                </p>
                
                <div style="background: #f9f9f9; padding: 25px; text-align: left; overflow: auto; border: 1px solid #eee; border-left: 5px solid #e11; border-radius: 8px; margin-bottom: 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                    <div style="font-weight: bold; margin-bottom: 10px; font-family: monospace; color: #e11;">
                        ${e.name || 'Error'}: ${e.message || 'Unknown fatal error'}
                    </div>
                    <pre style="font-size: 12px; color: #666; font-family: monospace; margin: 0; line-height: 1.5; white-space: pre-wrap;">
${e.stack || 'No stack trace available'}
                    </pre>
                </div>
                
                <div style="display: flex; gap: 15px; justify-content: center;">
                    <button onclick="location.reload(true)" style="padding: 12px 24px; background: #000; color: #fff; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 16px;">
                        Hard Reload Page
                    </button>
                    <button onclick="localStorage.clear(); location.reload(true)" style="padding: 12px 24px; background: #666; color: #fff; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 16px;">
                        Clear Cache & Retry
                    </button>
                </div>
                
                <p style="margin-top: 40px; color: #888; font-size: 14px;">
                    This error usually indicates a missing dependency, a syntax error in the deployment, 
                    or an environment variable mismatch.
                </p>
            </div>
        `;

        // Re-throw so it's also captured by the global window.onerror diagnostic bridge
        throw e;
    }
}

// Execute the bootstrap
bootstrap();

