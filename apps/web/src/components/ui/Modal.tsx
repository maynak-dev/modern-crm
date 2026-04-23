import { useEffect } from "react";
import { X } from "lucide-react";

export function Modal({ open, onClose, title, children }: {
  open: boolean; onClose: () => void; title: string; children: React.ReactNode;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="card w-full max-w-lg p-5 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold">{title}</h2>
          <button onClick={onClose} className="text-ink-muted hover:text-ink"><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}
