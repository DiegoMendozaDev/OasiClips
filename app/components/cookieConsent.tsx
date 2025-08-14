// components/CookieConsent.tsx
"use client";

import React from "react";
import { isAnalyticsAllowed, setAnalyticsAllowed } from "@/lib/analytics";

/**
 * CookieConsent
 * - no renderiza nada durante SSR (evita mismatches)
 * - una vez hidratado, consulta localStorage/flag y muestra el banner si hace falta
 */
export default function CookieConsent() {
  const [hydrated, setHydrated] = React.useState(false);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    // solo correr en cliente
    setHydrated(true);
    try {
      const consent = isAnalyticsAllowed();
      setVisible(!consent);
    } catch {
      setVisible(true);
    }
  }, []);

  if (!hydrated) return null; // NO renderizar durante SSR
  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Consentimiento de cookies"
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 z-50 bg-white border rounded-lg p-3 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-3"
      style={{ maxWidth: 920 }}
    >
      <div className="text-sm text-gray-700">
        Usamos analítica anónima para mejorar la experiencia. ¿Aceptas cookies
        de analítica?
      </div>

      <div className="flex gap-2 ml-0 md:ml-4">
        <button
          className="px-3 py-1 rounded-md text-sm border"
          onClick={() => {
            setAnalyticsAllowed(false);
            setVisible(false);
          }}
        >
          Rechazar
        </button>
        <button
          className="px-3 py-1 rounded-md bg-[var(--coral)] text-white text-sm"
          onClick={() => {
            setAnalyticsAllowed(true);
            setVisible(false);
          }}
        >
          Aceptar
        </button>
      </div>
    </div>
  );
}
