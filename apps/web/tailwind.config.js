/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: { DEFAULT: "#08080b", soft: "#0d0d12", panel: "#101016", border: "#1f1f29" },
        ink: { DEFAULT: "#e6e6ec", muted: "#9a9aab", faint: "#5b5b6e" },
        brand: { DEFAULT: "#6366f1", soft: "#818cf8", glow: "#a78bfa" },
        ok: "#10b981", warn: "#f59e0b", danger: "#ef4444",
      },
      fontFamily: {
        sans: ['"Inter"', "ui-sans-serif", "system-ui", "sans-serif"],
        display: ['"Geist"', '"Inter"', "ui-sans-serif", "system-ui"],
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(99,102,241,0.35), 0 8px 32px -8px rgba(99,102,241,0.45)",
        card: "0 1px 0 rgba(255,255,255,0.03) inset, 0 8px 24px -12px rgba(0,0,0,0.6)",
      },
    },
  },
  plugins: [],
};
