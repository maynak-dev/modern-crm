import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("demo@crm.app");
  const [password, setPassword] = useState("demo1234");
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);
  const nav = useNavigate();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { token, user } = await api<{ token: string; user: any }>("/auth/login", {
        method: "POST", body: JSON.stringify({ email, password }),
      });
      setAuth(token, user);
      toast.success(`Welcome back, ${user.name}`);
      nav("/");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 justify-center mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand to-brand-glow flex items-center justify-center shadow-glow">
            <Sparkles size={18} className="text-white" />
          </div>
          <div className="font-display font-semibold text-lg">Pulse CRM</div>
        </div>
        <div className="card p-6">
          <h1 className="text-lg font-semibold">Sign in</h1>
          <p className="text-sm text-ink-muted mt-1">Manage your pipeline with clarity.</p>
          <form onSubmit={onSubmit} className="mt-5 space-y-3">
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="label">Password</label>
              <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <button className="btn-primary w-full" disabled={loading}>{loading ? "Signing in…" : "Sign in"}</button>
          </form>
          <div className="text-xs text-ink-muted mt-4 text-center">
            No account? <Link to="/register" className="text-brand-soft hover:underline">Create one</Link>
          </div>
        </div>
        <div className="text-[11px] text-ink-faint mt-4 text-center">
          Default seed: demo@crm.app / demo1234
        </div>
      </div>
    </div>
  );
}
