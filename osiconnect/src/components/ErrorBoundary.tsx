'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';

interface Props {
    children: React.ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
    errorInfo?: React.ErrorInfo;
}

export class ErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('🚨 ErrorBoundary caught:', error, errorInfo);
        this.setState({ errorInfo });

        // Opcional: enviar a servicio de logging (Sentry, LogRocket, etc.)
        // logErrorToService(error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    };

    handleGoHome = () => {
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex min-h-screen items-center justify-center bg-background p-4">
                    <div className="max-w-md w-full space-y-6 text-center">
                        <div className="flex justify-center">
                            <div className="rounded-full bg-destructive/10 p-4">
                                <AlertTriangle className="w-12 h-12 text-destructive" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h1 className="text-3xl font-bold tracking-tight">
                                Algo salió mal
                            </h1>
                            <p className="text-muted-foreground">
                                Lo sentimos, ha ocurrido un error inesperado.
                            </p>
                        </div>

                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <div className="rounded-lg bg-muted p-4 text-left">
                                <p className="text-sm font-mono text-destructive break-all">
                                    {this.state.error.message}
                                </p>
                                {this.state.errorInfo && (
                                    <details className="mt-2">
                                        <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
                                            Ver stack trace
                                        </summary>
                                        <pre className="mt-2 text-xs overflow-auto max-h-40">
                                            {this.state.errorInfo.componentStack}
                                        </pre>
                                    </details>
                                )}
                            </div>
                        )}

                        <div className="flex gap-3 justify-center">
                            <Button
                                onClick={this.handleReset}
                                variant="outline"
                                className="gap-2"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Intentar de nuevo
                            </Button>
                            <Button
                                onClick={this.handleGoHome}
                                className="gap-2"
                            >
                                <Home className="w-4 h-4" />
                                Ir al inicio
                            </Button>
                        </div>

                        <p className="text-xs text-muted-foreground">
                            Si el problema persiste, contacta con soporte técnico.
                        </p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
