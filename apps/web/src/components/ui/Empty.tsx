import { Inbox } from "lucide-react";
export function Empty({ title, hint, action }: { title: string; hint?: string; action?: React.ReactNode }) {
  return (
    <div className="card p-10 flex flex-col items-center justify-center text-center">
      <div className="w-12 h-12 rounded-full bg-bg-soft border border-bg-border flex items-center justify-center mb-3">
        <Inbox size={20} className="text-ink-muted" />
      </div>
      <p className="font-medium">{title}</p>
      {hint && <p className="text-sm text-ink-muted mt-1 max-w-sm">{hint}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
