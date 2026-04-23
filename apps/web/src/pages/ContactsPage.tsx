import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Search, Pencil } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import { Modal } from "@/components/ui/Modal";
import { Empty } from "@/components/ui/Empty";

interface Contact {
  id: string; firstName: string; lastName: string; email: string; phone: string; title: string;
  companyId: string | null; tags: string[]; notes: string;
}

const empty: Omit<Contact, "id"> = { firstName: "", lastName: "", email: "", phone: "", title: "", companyId: null, tags: [], notes: "" };

export default function ContactsPage() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Contact | null>(null);
  const [form, setForm] = useState(empty);

  const { data: contacts = [] } = useQuery({
    queryKey: ["contacts", q],
    queryFn: () => api<Contact[]>(`/contacts${q ? `?q=${encodeURIComponent(q)}` : ""}`),
  });
  const { data: companies = [] } = useQuery({ queryKey: ["companies"], queryFn: () => api<any[]>("/companies") });

  const save = useMutation({
    mutationFn: (payload: any) =>
      editing
        ? api(`/contacts/${editing.id}`, { method: "PUT", body: JSON.stringify(payload) })
        : api(`/contacts`, { method: "POST", body: JSON.stringify(payload) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["contacts"] });
      setOpen(false); setEditing(null); setForm(empty);
      toast.success("Saved");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => api(`/contacts/${id}`, { method: "DELETE" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["contacts"] }); toast.success("Deleted"); },
  });

  function openNew() { setEditing(null); setForm(empty); setOpen(true); }
  function openEdit(c: Contact) {
    setEditing(c);
    setForm({ firstName: c.firstName, lastName: c.lastName, email: c.email, phone: c.phone, title: c.title, companyId: c.companyId, tags: c.tags || [], notes: c.notes });
    setOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-semibold tracking-tight">Contacts</h1>
          <p className="text-sm text-ink-muted mt-1">People you do business with.</p>
        </div>
        <button className="btn-primary" onClick={openNew}><Plus size={16}/> New contact</button>
      </div>

      <div className="card p-2 flex items-center gap-2">
        <Search size={16} className="text-ink-muted ml-2" />
        <input className="input border-0 focus:ring-0" placeholder="Search contacts…" value={q} onChange={(e)=>setQ(e.target.value)} />
      </div>

      {contacts.length === 0 ? (
        <Empty title="No contacts yet" hint="Add your first contact to start tracking relationships." action={<button className="btn-primary" onClick={openNew}><Plus size={16}/> Add contact</button>} />
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-bg-soft text-ink-muted">
              <tr className="text-left">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Phone</th>
                <th className="px-4 py-3 font-medium">Company</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((c) => {
                const company = companies.find((co: any) => co.id === c.companyId);
                return (
                  <tr key={c.id} className="border-t border-bg-border hover:bg-bg-soft/40">
                    <td className="px-4 py-3 font-medium">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-soft to-brand-glow text-white text-xs flex items-center justify-center">
                          {c.firstName[0]?.toUpperCase()}
                        </div>
                        {c.firstName} {c.lastName}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-ink-muted">{c.title || "—"}</td>
                    <td className="px-4 py-3 text-ink-muted">{c.email || "—"}</td>
                    <td className="px-4 py-3 text-ink-muted">{c.phone || "—"}</td>
                    <td className="px-4 py-3 text-ink-muted">{company?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-right">
                      <button className="text-ink-muted hover:text-ink p-1" onClick={() => openEdit(c)}><Pencil size={15}/></button>
                      <button className="text-ink-muted hover:text-danger p-1" onClick={() => confirm("Delete contact?") && remove.mutate(c.id)}><Trash2 size={15}/></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "Edit contact" : "New contact"}>
        <form onSubmit={(e)=>{ e.preventDefault(); save.mutate(form); }} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">First name</label>
              <input className="input" required value={form.firstName} onChange={(e)=>setForm({...form, firstName: e.target.value})} /></div>
            <div><label className="label">Last name</label>
              <input className="input" value={form.lastName} onChange={(e)=>setForm({...form, lastName: e.target.value})} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Email</label>
              <input className="input" type="email" value={form.email} onChange={(e)=>setForm({...form, email: e.target.value})} /></div>
            <div><label className="label">Phone</label>
              <input className="input" value={form.phone} onChange={(e)=>setForm({...form, phone: e.target.value})} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Title</label>
              <input className="input" value={form.title} onChange={(e)=>setForm({...form, title: e.target.value})} /></div>
            <div><label className="label">Company</label>
              <select className="input" value={form.companyId ?? ""} onChange={(e)=>setForm({...form, companyId: e.target.value || null})}>
                <option value="">— none —</option>
                {companies.map((co:any) => <option key={co.id} value={co.id}>{co.name}</option>)}
              </select>
            </div>
          </div>
          <div><label className="label">Notes</label>
            <textarea className="input min-h-[88px]" value={form.notes} onChange={(e)=>setForm({...form, notes: e.target.value})} /></div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-ghost" onClick={()=>setOpen(false)}>Cancel</button>
            <button className="btn-primary" disabled={save.isPending}>{save.isPending ? "Saving…" : "Save"}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
