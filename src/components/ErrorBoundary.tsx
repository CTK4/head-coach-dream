import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { logError } from "@/lib/logger";

type Props = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  onExportDebugBundle?: () => void;
  onResetToMainMenu?: () => void;
};

type State = {
  hasError: boolean;
};

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    logError("ui.error_boundary", {
      meta: {
        message: error.message,
        componentStack: errorInfo.componentStack?.slice(0, 2000),
      },
    });
    this.props.onError?.(error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetToMainMenu = () => {
    if (this.props.onResetToMainMenu) {
      this.props.onResetToMainMenu();
      return;
    }
    sessionStorage.setItem("show_main_menu", "1");
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <Card className="max-w-lg w-full">
            <CardHeader>
              <CardTitle>Something went wrong</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                We hit an unexpected issue. Your latest data is still stored locally.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button onClick={this.handleReload}>Reload App</Button>
                <Button variant="secondary" onClick={this.props.onExportDebugBundle} disabled={!this.props.onExportDebugBundle}>Export Debug Bundle</Button>
                <Button variant="outline" onClick={this.handleResetToMainMenu}>Reset to Main Menu</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
