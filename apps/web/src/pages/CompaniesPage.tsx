import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Pencil, Building2 } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import { Modal } from "@/components/ui/Modal";
import { Empty } from "@/components/ui/Empty";

interface Company { id: string; name: string; domain: string; industry: string; size: string; website: string; notes: string; }
const empty: Omit<Company, "id"> = { name: "", domain: "", industry: "", size: "", website: "", notes: "" };

export default function CompaniesPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Company | null>(null);
  const [form, setForm] = useState(empty);

  const { data: companies = [] } = useQuery({ queryKey: ["companies"], queryFn: () => api<Company[]>("/companies") });

  const save = useMutation({
    mutationFn: (payload: any) =>
      editing
        ? api(`/companies/${editing.id}`, { method: "PUT", body: JSON.stringify(payload) })
        : api(`/companies`, { method: "POST", body: JSON.stringify(payload) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["companies"] }); setOpen(false); setEditing(null); setForm(empty); toast.success("Saved"); },
    onError: (e: any) => toast.error(e.message),
  });
  const remove = useMutation({
    mutationFn: (id: string) => api(`/companies/${id}`, { method: "DELETE" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["companies"] }); toast.success("Deleted"); },
  });

  function openEdit(c: Company) {
    setEditing(c);
    setForm({ name: c.name, domain: c.domain, industry: c.industry, size: c.size, website: c.website, notes: c.notes });
    setOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-semibold tracking-tight">Companies</h1>
          <p className="text-sm text-ink-muted mt-1">Organizations in your network.</p>
        </div>
        <button className="btn-primary" onClick={()=>{setEditing(null); setForm(empty); setOpen(true);}}><Plus size={16}/> New company</button>
      </div>

      {companies.length === 0 ? (
        <Empty title="No companies yet" hint="Track the organizations behind your contacts and deals." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {companies.map((c) => (
            <div key={c.id} className="card p-5 group hover:border-brand/40 transition">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-bg-soft border border-bg-border flex items-center justify-center">
                    <Building2 size={18} className="text-brand-soft" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium truncate">{c.name}</div>
                    <div className="text-xs text-ink-muted truncate">{c.domain || c.website || "—"}</div>
                  </div>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition flex items-center gap-1">
                  <button className="text-ink-muted hover:text-ink p-1" onClick={()=>openEdit(c)}><Pencil size={14}/></button>
                  <button className="text-ink-muted hover:text-danger p-1" onClick={()=>confirm("Delete company?") && remove.mutate(c.id)}><Trash2 size={14}/></button>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {c.industry && <span className="badge border-bg-border text-ink-muted">{c.industry}</span>}
                {c.size && <span className="badge border-bg-border text-ink-muted">{c.size}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={open} onClose={()=>setOpen(false)} title={editing ? "Edit company" : "New company"}>
        <form onSubmit={(e)=>{e.preventDefault(); save.mutate(form);}} className="space-y-3">
          <div><label className="label">Name</label>
            <input className="input" required value={form.name} onChange={(e)=>setForm({...form, name: e.target.value})}/></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Domain</label>
              <input className="input" value={form.domain} onChange={(e)=>setForm({...form, domain: e.target.value})}/></div>
            <div><label className="label">Website</label>
              <input className="input" value={form.website} onChange={(e)=>setForm({...form, website: e.target.value})}/></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Industry</label>
              <input className="input" value={form.industry} onChange={(e)=>setForm({...form, industry: e.target.value})}/></div>
            <div><label className="label">Size</label>
              <input className="input" value={form.size} onChange={(e)=>setForm({...form, size: e.target.value})} placeholder="e.g. 50-200"/></div>
          </div>
          <div><label className="label">Notes</label>
            <textarea className="input min-h-[88px]" value={form.notes} onChange={(e)=>setForm({...form, notes: e.target.value})}/></div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-ghost" onClick={()=>setOpen(false)}>Cancel</button>
            <button className="btn-primary" disabled={save.isPending}>{save.isPending ? "Saving…" : "Save"}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
