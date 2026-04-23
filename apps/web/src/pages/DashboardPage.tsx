import { useQuery } from "@tanstack/react-query";
import { api, fmtMoney } from "@/lib/api";
import { StatCard } from "@/components/ui/StatCard";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { useAuthStore } from "@/store/auth";

const STAGES = ["lead", "qualified", "proposal", "negotiation", "won", "lost"];

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { data } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => api<any>("/dashboard"),
  });

  const chartData = STAGES.map((s) => ({
    stage: s,
    value: data?.byStage?.[s]?.value ?? 0,
    count: data?.byStage?.[s]?.count ?? 0,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-semibold tracking-tight">
          Welcome back, {user?.name?.split(" ")[0] ?? "there"}.
        </h1>
        <p className="text-sm text-ink-muted mt-1">Here's what's happening across your pipeline.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Pipeline value" value={fmtMoney(data?.pipelineValue ?? 0)} hint="Open deals" accent="brand" />
        <StatCard label="Won this period" value={fmtMoney(data?.wonValue ?? 0)} hint="Closed-won" accent="ok" />
        <StatCard label="Contacts" value={data?.counts?.contacts ?? 0} />
        <StatCard label="Open tasks" value={data?.counts?.openTasks ?? 0} accent="warn" />
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-medium">Pipeline by stage</h2>
            <p className="text-xs text-ink-muted">Total deal value at each stage</p>
          </div>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid stroke="#1f1f29" vertical={false} />
              <XAxis dataKey="stage" stroke="#9a9aab" tickLine={false} axisLine={false} />
              <YAxis stroke="#9a9aab" tickLine={false} axisLine={false} tickFormatter={(v) => `$${v/1000}k`} />
              <Tooltip
                cursor={{ fill: "rgba(99,102,241,0.08)" }}
                contentStyle={{ background: "#101016", border: "1px solid #1f1f29", borderRadius: 8 }}
                formatter={(v: any) => fmtMoney(Number(v))}
              />
              <Bar dataKey="value" fill="url(#g)" radius={[6,6,0,0]} />
              <defs>
                <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a78bfa" />
                  <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
