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
                <div style={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#fff',
                    color: '#000',
                    padding: '20px',
                    fontFamily: 'system-ui, sans-serif'
                }}>
                    <div style={{
                        maxWidth: '400px',
                        width: '100%',
                        textAlign: 'center',
                        padding: '40px',
                        border: '1px solid #eaeaea',
                        borderRadius: '12px',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
                    }}>
                        <h1 style={{fontSize: '24px', fontWeight: 'bold', marginBottom: '10px'}}>Something went wrong</h1>
                        <p style={{color: '#666', marginBottom: '20px'}}>
                            An unexpected error occurred during rendering.
                        </p>

                        {this.state.error && (
                            <div style={{
                                backgroundColor: '#f5f5f5',
                                padding: '15px',
                                borderRadius: '8px',
                                textAlign: 'left',
                                overflow: 'auto',
                                maxHeight: '200px',
                                marginBottom: '20px'
                            }}>
                                <p style={{fontSize: '12px', fontFamily: 'monospace', color: '#e11', wordBreak: 'break-all', margin: 0}}>
                                    {this.state.error.name}: {this.state.error.message}
                                </p>
                            </div>
                        )}

                        <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                            <button 
                                onClick={this.handleReset}
                                style={{
                                    padding: '12px',
                                    backgroundColor: '#000',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontWeight: 'bold'
                                }}
                            >
                                Reload Page
                            </button>
                            <button 
                                onClick={this.handleGoHome}
                                style={{
                                    padding: '12px',
                                    backgroundColor: 'transparent',
                                    color: '#000',
                                    border: '1px solid #000',
                                    borderRadius: '6px',
                                    cursor: 'pointer'
                                }}
                            >
                                Go to Home
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
