// components/ThemeToggle.tsx
"use client";

import React, { useEffect, useState } from "react";

const LS_KEY = "oasiclips_theme";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark" | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LS_KEY);
      if (stored === "dark" || stored === "light") {
        setTheme(stored);
        return;
      }
    } catch {}
    // fallback to current document state (script in layout should have set it)
    try {
      const docHas = document.documentElement.classList.contains("dark");
      setTheme(docHas ? "dark" : "light");
    } catch {
      setTheme("light");
    }
  }, []);

  useEffect(() => {
    if (!theme) return;
    try {
      localStorage.setItem(LS_KEY, theme);
    } catch {}
    try {
      if (theme === "dark") {
        document.documentElement.classList.add("dark");
        document.documentElement.setAttribute("data-theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        document.documentElement.setAttribute("data-theme", "light");
      }
    } catch {}
  }, [theme]);

  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={theme === "dark"}
      aria-label={
        theme === "dark" ? "Cambiar a tema claro" : "Cambiar a tema oscuro"
      }
      className="p-2 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mint)]"
      style={{
        background: "transparent",
        border: "1px solid rgba(3,60,87,0.06)",
      }}
    >
      {theme === "dark" ? (
        // Sun icon (light = current state is dark -> show sun to switch)
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
          <path
            fill="currentColor"
            d="M6.76 4.84l-1.8-1.79L3.17 4.85l1.79 1.79L6.76 4.84zM1 13h3v-2H1v2zm10 8h2v-3h-2v3zm7.04-2.46l1.79 1.79 1.79-1.79-1.79-1.79-1.79 1.79zM17.24 4.84l1.79-1.79 1.79 1.79-1.79 1.79-1.79-1.79zM20 11v2h3v-2h-3zM4.22 19.78l1.79-1.79L4.22 16.2 2.43 17.99l1.79 1.79zM12 6a6 6 0 100 12 6 6 0 000-12z"
          />
        </svg>
      ) : (
        // Moon icon (dark = current state is light -> show moon to switch)
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
          <path
            fill="currentColor"
            d="M21.64 13.19A9 9 0 1110.81 2.36a7 7 0 1010.83 10.83z"
          />
        </svg>
      )}
    </button>
  );
}
