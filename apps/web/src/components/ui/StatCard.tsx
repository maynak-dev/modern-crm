export function StatCard({ label, value, hint, accent }: {
  label: string; value: string | number; hint?: string; accent?: "brand" | "ok" | "warn";
}) {
  const ring =
    accent === "ok" ? "ring-ok/20" :
    accent === "warn" ? "ring-warn/20" :
    "ring-brand/20";
  return (
    <div className={`card p-5 ring-1 ${ring}`}>
      <div className="text-xs uppercase tracking-wider text-ink-muted">{label}</div>
      <div className="mt-2 text-2xl font-display font-semibold">{value}</div>
      {hint && <div className="mt-1 text-xs text-ink-faint">{hint}</div>}
    </div>
  );
}
