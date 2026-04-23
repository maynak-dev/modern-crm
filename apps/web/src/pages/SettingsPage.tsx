import { useAuthStore } from "@/store/auth";

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-ink-muted mt-1">Account preferences.</p>
      </div>
      <div className="card p-6 max-w-md">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-soft to-brand-glow text-white flex items-center justify-center font-semibold">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <div className="font-medium">{user?.name}</div>
            <div className="text-sm text-ink-muted">{user?.email}</div>
          </div>
        </div>
        <div className="mt-6 text-xs text-ink-muted">
          Profile editing & team management coming soon.
        </div>
      </div>
    </div>
  );
}
