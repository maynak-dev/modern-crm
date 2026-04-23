import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DragDropContext, Draggable, Droppable, DropResult } from "@hello-pangea/dnd";
import { Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { api, fmtMoney } from "@/lib/api";
import { Modal } from "@/components/ui/Modal";

const STAGES = [
  { id: "lead",         label: "Lead",         tint: "from-slate-500/20 to-slate-500/5" },
  { id: "qualified",    label: "Qualified",    tint: "from-blue-500/20 to-blue-500/5" },
  { id: "proposal",     label: "Proposal",     tint: "from-indigo-500/25 to-indigo-500/5" },
  { id: "negotiation",  label: "Negotiation",  tint: "from-violet-500/25 to-violet-500/5" },
  { id: "won",          label: "Won",          tint: "from-emerald-500/25 to-emerald-500/5" },
  { id: "lost",         label: "Lost",         tint: "from-rose-500/20 to-rose-500/5" },
] as const;

interface Deal {
  id: string; title: string; value: number; currency: string; stage: string;
  contactId: string | null; companyId: string | null; expectedCloseDate: string | null; notes: string;
}
const empty = { title: "", value: 0, currency: "USD", stage: "lead", contactId: null, companyId: null, expectedCloseDate: null, notes: "" };

export default function DealsPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>(empty);

  const { data: deals = [] } = useQuery({ queryKey: ["deals"], queryFn: () => api<Deal[]>("/deals") });
  const { data: contacts = [] } = useQuery({ queryKey: ["contacts"], queryFn: () => api<any[]>("/contacts") });
  const { data: companies = [] } = useQuery({ queryKey: ["companies"], queryFn: () => api<any[]>("/companies") });

  const grouped = useMemo(() => {
    const g: Record<string, Deal[]> = Object.fromEntries(STAGES.map((s) => [s.id, []]));
    for (const d of deals) (g[d.stage] ??= []).push(d);
    return g;
  }, [deals]);

  const update = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Deal> }) =>
      api(`/deals/${id}`, { method: "PUT", body: JSON.stringify(patch) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["deals"] }); qc.invalidateQueries({ queryKey: ["dashboard"] }); },
  });
  const create = useMutation({
    mutationFn: (payload: any) => api("/deals", { method: "POST", body: JSON.stringify(payload) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["deals"] }); qc.invalidateQueries({ queryKey: ["dashboard"] }); setOpen(false); setForm(empty); toast.success("Deal created"); },
    onError: (e: any) => toast.error(e.message),
  });
  const remove = useMutation({
    mutationFn: (id: string) => api(`/deals/${id}`, { method: "DELETE" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["deals"] }); qc.invalidateQueries({ queryKey: ["dashboard"] }); },
  });

  function onDragEnd(r: DropResult) {
    if (!r.destination) return;
    const newStage = r.destination.droppableId;
    if (r.source.droppableId === newStage) return;
    update.mutate({ id: r.draggableId, patch: { stage: newStage } });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-semibold tracking-tight">Pipeline</h1>
          <p className="text-sm text-ink-muted mt-1">Drag deals between stages to update them.</p>
        </div>
        <button className="btn-primary" onClick={()=>setOpen(true)}><Plus size={16}/> New deal</button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {STAGES.map((s) => {
            const items = grouped[s.id] ?? [];
            const total = items.reduce((sum, d) => sum + (d.value || 0), 0);
            return (
              <Droppable droppableId={s.id} key={s.id}>
                {(provided, snap) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`rounded-xl border border-bg-border bg-gradient-to-b ${s.tint} p-3 min-h-[300px] transition ${snap.isDraggingOver ? "border-brand/50 shadow-glow" : ""}`}
                  >
                    <div className="flex items-center justify-between px-1 mb-3">
                      <div className="text-xs font-semibold uppercase tracking-wider text-ink">{s.label}</div>
                      <div className="text-[11px] text-ink-muted">{items.length} · {fmtMoney(total)}</div>
                    </div>
                    <div className="space-y-2">
                      {items.map((d, i) => (
                        <Draggable draggableId={d.id} index={i} key={d.id}>
                          {(p, snap2) => (
                            <div
                              ref={p.innerRef}
                              {...p.draggableProps}
                              {...p.dragHandleProps}
                              className={`card p-3 cursor-grab active:cursor-grabbing ${snap2.isDragging ? "shadow-glow border-brand/50" : ""}`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="text-sm font-medium leading-snug">{d.title}</div>
                                <button className="text-ink-faint hover:text-danger" onClick={()=>confirm("Delete deal?") && remove.mutate(d.id)}>
                                  <Trash2 size={13}/>
                                </button>
                              </div>
                              <div className="mt-2 text-[11px] text-ink-muted">{fmtMoney(d.value, d.currency)}</div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            );
          })}
        </div>
      </DragDropContext>

      <Modal open={open} onClose={()=>setOpen(false)} title="New deal">
        <form onSubmit={(e)=>{e.preventDefault(); create.mutate({ ...form, value: Number(form.value)||0 });}} className="space-y-3">
          <div><label className="label">Title</label>
            <input className="input" required value={form.title} onChange={(e)=>setForm({...form, title: e.target.value})}/></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Value</label>
              <input className="input" type="number" min="0" value={form.value} onChange={(e)=>setForm({...form, value: e.target.value})}/></div>
            <div><label className="label">Stage</label>
              <select className="input" value={form.stage} onChange={(e)=>setForm({...form, stage: e.target.value})}>
                {STAGES.map((s)=> <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Contact</label>
              <select className="input" value={form.contactId ?? ""} onChange={(e)=>setForm({...form, contactId: e.target.value || null})}>
                <option value="">— none —</option>
                {contacts.map((c:any)=> <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
              </select>
            </div>
            <div><label className="label">Company</label>
              <select className="input" value={form.companyId ?? ""} onChange={(e)=>setForm({...form, companyId: e.target.value || null})}>
                <option value="">— none —</option>
                {companies.map((c:any)=> <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div><label className="label">Notes</label>
            <textarea className="input min-h-[80px]" value={form.notes} onChange={(e)=>setForm({...form, notes: e.target.value})}/></div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-ghost" onClick={()=>setOpen(false)}>Cancel</button>
            <button className="btn-primary" disabled={create.isPending}>{create.isPending ? "Saving…" : "Create deal"}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
