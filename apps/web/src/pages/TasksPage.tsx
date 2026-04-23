import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, CheckCircle2, Circle, Loader } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import { Modal } from "@/components/ui/Modal";
import { Empty } from "@/components/ui/Empty";

interface Task {
  id: string; title: string; description: string; dueDate: string | null;
  status: "todo" | "in_progress" | "done"; priority: "low"|"medium"|"high";
  contactId: string | null; dealId: string | null;
}
const empty = { title: "", description: "", dueDate: null, status: "todo", priority: "medium", contactId: null, dealId: null };

const PRIORITY_STYLES: Record<string, string> = {
  low: "border-slate-500/30 text-slate-300",
  medium: "border-warn/30 text-warn",
  high: "border-danger/30 text-danger",
};

export default function TasksPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>(empty);

  const { data: tasks = [] } = useQuery({ queryKey: ["tasks"], queryFn: () => api<Task[]>("/tasks") });

  const create = useMutation({
    mutationFn: (payload: any) => api("/tasks", { method: "POST", body: JSON.stringify(payload) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["tasks"] }); qc.invalidateQueries({ queryKey: ["dashboard"] }); setOpen(false); setForm(empty); toast.success("Task added"); },
    onError: (e:any) => toast.error(e.message),
  });
  const update = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Task> }) =>
      api(`/tasks/${id}`, { method: "PUT", body: JSON.stringify(patch) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["tasks"] }); qc.invalidateQueries({ queryKey: ["dashboard"] }); },
  });
  const remove = useMutation({
    mutationFn: (id: string) => api(`/tasks/${id}`, { method: "DELETE" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["tasks"] }); qc.invalidateQueries({ queryKey: ["dashboard"] }); },
  });

  function cycleStatus(t: Task) {
    const next = t.status === "todo" ? "in_progress" : t.status === "in_progress" ? "done" : "todo";
    update.mutate({ id: t.id, patch: { status: next } });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-semibold tracking-tight">Tasks</h1>
          <p className="text-sm text-ink-muted mt-1">Stay on top of follow-ups and to-dos.</p>
        </div>
        <button className="btn-primary" onClick={()=>setOpen(true)}><Plus size={16}/> New task</button>
      </div>

      {tasks.length === 0 ? (
        <Empty title="No tasks yet" />
      ) : (
        <div className="card divide-y divide-bg-border">
          {tasks.map((t) => {
            const Icon = t.status === "done" ? CheckCircle2 : t.status === "in_progress" ? Loader : Circle;
            const iconColor = t.status === "done" ? "text-ok" : t.status === "in_progress" ? "text-brand-soft" : "text-ink-faint";
            return (
              <div key={t.id} className="flex items-center gap-3 px-4 py-3 hover:bg-bg-soft/40">
                <button onClick={()=>cycleStatus(t)} className={iconColor}><Icon size={18} /></button>
                <div className="min-w-0 flex-1">
                  <div className={`text-sm font-medium ${t.status === "done" ? "line-through text-ink-faint" : ""}`}>{t.title}</div>
                  {t.description && <div className="text-xs text-ink-muted mt-0.5 truncate">{t.description}</div>}
                </div>
                <span className={`badge ${PRIORITY_STYLES[t.priority]}`}>{t.priority}</span>
                <button onClick={()=>confirm("Delete task?") && remove.mutate(t.id)} className="text-ink-faint hover:text-danger p-1"><Trash2 size={14}/></button>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={open} onClose={()=>setOpen(false)} title="New task">
        <form onSubmit={(e)=>{e.preventDefault(); create.mutate(form);}} className="space-y-3">
          <div><label className="label">Title</label>
            <input className="input" required value={form.title} onChange={(e)=>setForm({...form, title: e.target.value})}/></div>
          <div><label className="label">Description</label>
            <textarea className="input min-h-[72px]" value={form.description} onChange={(e)=>setForm({...form, description: e.target.value})}/></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Priority</label>
              <select className="input" value={form.priority} onChange={(e)=>setForm({...form, priority: e.target.value})}>
                <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
              </select>
            </div>
            <div><label className="label">Status</label>
              <select className="input" value={form.status} onChange={(e)=>setForm({...form, status: e.target.value})}>
                <option value="todo">To do</option><option value="in_progress">In progress</option><option value="done">Done</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-ghost" onClick={()=>setOpen(false)}>Cancel</button>
            <button className="btn-primary" disabled={create.isPending}>{create.isPending ? "Saving…" : "Add task"}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
