import { Link, useSearchParams } from "react-router-dom";

interface StubPageProps {
  title: string;
  description?: string;
  backHref?: string;
}

export function StubPage({ title, description, backHref = "/hub" }: StubPageProps) {
  const [searchParams] = useSearchParams();
  const entries = Object.fromEntries(searchParams.entries());

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-md px-4 py-6">
        <div className="mb-4">
          <div className="text-xs uppercase tracking-widest text-slate-400">Placeholder</div>
          <h1 className="mt-1 text-2xl font-semibold">{title}</h1>
          {description ? <p className="mt-1 text-sm text-slate-300">{description}</p> : null}
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
          <div className="text-sm font-medium">Not implemented yet</div>
          <p className="mt-1 text-sm text-slate-300">This page exists so Hub navigation is never a dead tap.</p>

          <div className="mt-4 rounded-lg border border-slate-800 bg-slate-950/40 p-3">
            <div className="text-xs uppercase tracking-widest text-slate-400">Debug</div>
            <pre className="mt-2 overflow-auto text-xs text-slate-200">{JSON.stringify({ query: entries }, null, 2)}</pre>
          </div>

          <div className="mt-4 flex gap-2">
            <Link to={backHref} className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-center text-sm font-semibold">
              Back to Hub
            </Link>
            <Link to="/timeline" className="flex-1 rounded-lg border border-slate-700 px-3 py-2 text-center text-sm font-semibold">
              Timeline
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
