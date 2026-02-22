type PlaceholderPlaybookProps = {
  title: string;
  system: string;
};

export default function PlaceholderPlaybook({ title, system }: PlaceholderPlaybookProps) {
  return (
    <div className="p-4 sm:p-6">
      <div className="rounded-xl border border-dashed border-white/20 bg-white/5 p-4 sm:p-6">
        <h3 className="text-sm font-semibold tracking-wide text-slate-100">{title}</h3>
        <p className="mt-2 text-xs text-muted-foreground">
          Detailed diagrams for <span className="font-semibold text-slate-200">{system}</span> will be added in a
          future update.
        </p>
      </div>
    </div>
  );
}
