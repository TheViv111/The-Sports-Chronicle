import "./index.css";

// Catch unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
    console.error('DEBUG: Unhandled promise rejection:', event.reason);
});

console.log("DEBUG: main.tsx script parsing complete");

/**
 * Bootstrap the application using dynamic imports to catch module-level crashes.
 */
async function bootstrap() {
    const rootElement = document.getElementById("root");
    if (!rootElement) {
        console.error("CRITICAL: Root element not found");
        return;
    }

    console.log("DEBUG: Bootstrap sequence initiated...");

    try {
        // Dynamic loading of all core dependencies
        console.log("DEBUG: Loading core libraries (react-dom, App, ErrorBoundary)...");

        const [ReactDOMModule, AppModule, ErrorBoundaryModule] = await Promise.all([
            import("react-dom/client"),
            import("./App.tsx"),
            import("./components/common/ErrorBoundary")
        ]);

        const { createRoot } = ReactDOMModule;
        const App = AppModule.default;
        const ErrorBoundary = ErrorBoundaryModule.default;

        console.log("DEBUG: All modules resolved. Mounting application...");

        const root = createRoot(rootElement);
        root.render(
            <ErrorBoundary>
                <App />
            </ErrorBoundary>
        );

        console.log("DEBUG: React render call successful.");
    } catch (e: any) {
        console.error("DEBUG: FATAL BOOTSTRAP EXCEPTION:", e);

        // Final fallback UI in case everything else fails
        rootElement.innerHTML = `
            <div style="padding: 40px; color: #000; font-family: system-ui, sans-serif; text-align: center; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #e11; font-size: 24px;">⚠️ Boot Phase Crash</h1>
                <p style="margin: 10px 0; color: #444;">A fatal error occurred before the application could start.</p>
                <div style="background: #f9f9f9; padding: 20px; text-align: left; border-left: 5px solid #e11; border-radius: 4px; margin: 20px 0;">
                    <div style="font-weight: bold; color: #e11; margin-bottom: 5px;">${e.name || 'Error'}: ${e.message || 'Unknown'}</div>
                    <pre style="font-size: 11px; white-space: pre-wrap; color: #666; margin: 0;">${e.stack || ''}</pre>
                </div>
                <button onclick="location.reload(true)" style="padding: 12px 24px; background: #000; color: #fff; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">
                    Hard Reload (Clear Cache)
                </button>
            </div>
        `;

        // Re-throw so the Diagnostic Bridge in index.html catches it too
        throw e;
    }
}

// Start the bootstrap
bootstrap();

