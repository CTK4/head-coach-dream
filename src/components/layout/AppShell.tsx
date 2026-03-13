import { Outlet, useNavigate } from "react-router-dom";
import { BottomNav } from "./BottomNav";
import { useDesignTokens } from "@/design/useDesignTokens";
import FeedbackToast from "@/components/feedback/FeedbackToast";
import InjuryAlertController from "@/components/feedback/InjuryAlertController";
import { useGame } from "@/context/GameContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { exportDebugBundle } from "@/lib/debugBundle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AppShell() {
  const style = useDesignTokens();
  const navigate = useNavigate();
  const { state, dispatch } = useGame();

  const onBackToHub = () => {
    dispatch({ type: "EXIT_GAME" });
    navigate("/hub");
  };

  return (
    <div style={style} className="flex min-h-screen flex-col bg-surface-background text-slate-100">
      <div className="flex-1 pb-[calc(6rem+env(safe-area-inset-bottom))]">
        <ErrorBoundary
          onExportDebugBundle={() => {
            void exportDebugBundle({ state, saveMeta: null });
          }}
          fallback={(
            <div className="flex min-h-screen items-center justify-center p-4 bg-slate-950">
              <Card className="w-full max-w-lg border-white/10 bg-slate-900/70 text-slate-100">
                <CardHeader>
                  <CardTitle>Something went wrong</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">The current page crashed. You can return to the hub and keep playing.</p>
                  <div className="flex flex-wrap gap-2">
                    <Button className="bg-blue-700 hover:bg-blue-600" onClick={onBackToHub}>Back to Hub</Button>
                    <Button variant="secondary" onClick={() => {
                      void exportDebugBundle({ state, saveMeta: null });
                    }}>
                      Export Debug Bundle
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        >
          <Outlet />
        </ErrorBoundary>
      </div>
      <FeedbackToast />
      <InjuryAlertController />
      <BottomNav />
    </div>
  );
}
