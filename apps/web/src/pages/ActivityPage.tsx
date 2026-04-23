import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { api } from "@/lib/api";
import { Empty } from "@/components/ui/Empty";

interface Activity { id: string; type: string; entity: string; entityId: string | null; message: string; createdAt: string; }

const ENTITY_COLOR: Record<string, string> = {
  contact: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  deal: "bg-violet-500/15 text-violet-300 border-violet-500/30",
  company: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  task: "bg-amber-500/15 text-amber-300 border-amber-500/30",
};

export default function ActivityPage() {
  const { data: items = [] } = useQuery({ queryKey: ["activities"], queryFn: () => api<Activity[]>("/activities") });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-semibold tracking-tight">Activity</h1>
        <p className="text-sm text-ink-muted mt-1">A live timeline of everything happening in your CRM.</p>
      </div>
      {items.length === 0 ? (
        <Empty title="No activity yet" hint="Create a contact, company, deal, or task to see entries appear here." />
      ) : (
        <div className="card p-2">
          <ol className="relative">
            {items.map((a, i) => (
              <li key={a.id} className="flex gap-4 px-4 py-3">
                <div className="flex flex-col items-center">
                  <div className={`badge ${ENTITY_COLOR[a.entity] ?? "border-bg-border text-ink-muted"}`}>{a.entity}</div>
                  {i < items.length - 1 && <div className="flex-1 w-px bg-bg-border my-2" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm">{a.message}</div>
                  <div className="text-[11px] text-ink-faint mt-0.5">{formatDistanceToNow(new Date(a.createdAt), { addSuffix: true })}</div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
