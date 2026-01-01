import { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle, RefreshCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    private handleReset = () => {
        this.setState({ hasError: false, error: null });
        window.location.reload();
    };

    private handleGoHome = () => {
        this.setState({ hasError: false, error: null });
        window.location.href = "/";
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-background p-4">
                    <div className="max-w-md w-full bg-card border rounded-xl p-8 shadow-lg text-center">
                        <div className="flex justify-center mb-6">
                            <div className="p-3 bg-destructive/10 rounded-full">
                                <AlertCircle className="w-12 h-12 text-destructive" />
                            </div>
                        </div>

                        <h1 className="text-2xl font-bold font-heading mb-2">Something went wrong</h1>
                        <p className="text-muted-foreground mb-6">
                            An unexpected error occurred. This might be due to a connection issue or an environment misconfiguration.
                        </p>

                        {this.state.error && (
                            <div className="bg-muted p-4 rounded-md mb-8 text-left overflow-auto max-h-40">
                                <p className="text-xs font-mono text-destructive break-all">
                                    {this.state.error.name}: {this.state.error.message}
                                </p>
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Button onClick={this.handleReset} className="flex items-center gap-2">
                                <RefreshCcw className="w-4 h-4" />
                                Reload Page
                            </Button>
                            <Button onClick={this.handleGoHome} variant="outline" className="flex items-center gap-2">
                                <Home className="w-4 h-4" />
                                Go to Home
                            </Button>
                        </div>

                        <p className="mt-8 text-xs text-muted-foreground">
                            If this problem persists, please check the browser console or contact support.
                        </p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
