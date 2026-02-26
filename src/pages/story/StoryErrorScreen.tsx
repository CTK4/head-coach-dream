import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/routes/appRoutes";

type StoryErrorScreenProps = {
  error?: Error | null;
};

export default function StoryErrorScreen({ error }: StoryErrorScreenProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="max-w-xl w-full">
        <CardHeader>
          <CardTitle>Story Mode failed to load</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            We could not load story mode data right now. You can return to Save Mode and try again.
          </p>
          <div className="flex gap-2">
            <Button onClick={() => navigate(ROUTES.saveMode)}>Back to Save Mode</Button>
            <Button variant="outline" onClick={() => window.location.reload()}>Reload</Button>
          </div>
          {import.meta.env.DEV && error ? (
            <details className="rounded border p-3 text-xs whitespace-pre-wrap">
              <summary className="cursor-pointer font-semibold">Developer details</summary>
              <div className="mt-2">{error.message}</div>
              {error.stack ? <pre className="mt-2 overflow-auto">{error.stack}</pre> : null}
            </details>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
