const BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";

function getToken() {
  try {
    const raw = localStorage.getItem("crm-auth");
    return raw ? (JSON.parse(raw).state?.token as string | null) : null;
  } catch {
    return null;
  }
}

export async function api<T = any>(path: string, opts: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opts.headers || {}),
    },
  });
  if (res.status === 401) {
    localStorage.removeItem("crm-auth");
    if (location.pathname !== "/login") location.href = "/login";
  }
  if (!res.ok) {
    const text = await res.text();
    let msg = res.statusText;
    try { msg = JSON.parse(text).error || msg; } catch {}
    throw new Error(typeof msg === "string" ? msg : "Request failed");
  }
  return res.json();
}

export const fmtMoney = (n: number, currency = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(n);
