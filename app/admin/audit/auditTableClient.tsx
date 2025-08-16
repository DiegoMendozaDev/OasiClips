// app/admin/audit/AuditTableClient.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";

export type AuditRowSerializable = {
  id: string;
  action: string;
  targetId?: string | null;
  actor?: string | null;
  meta?: any;
  createdAt: string; // ISO string
};

export default function AuditTableClient({ rows }: { rows: AuditRowSerializable[] }) {
  const [selected, setSelected] = useState<AuditRowSerializable | null>(null);

  // modal focus management
  const lastActiveRef = useRef<HTMLElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (selected) {
      // save last focused
      lastActiveRef.current = document.activeElement as HTMLElement | null;
      // lock scroll
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      // move focus to close button after paint
      setTimeout(() => closeBtnRef.current?.focus(), 20);

      // escape handler
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") setSelected(null);
      };
      document.addEventListener("keydown", onKey);

      return () => {
        document.body.style.overflow = prev;
        document.removeEventListener("keydown", onKey);
        // restore focus
        lastActiveRef.current?.focus();
      };
    }
  }, [selected]);

  return (
    <>
      <div className="overflow-x-auto bg-white border rounded shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Created</th>
              <th className="p-2 text-left">Action</th>
              <th className="p-2 text-left">Target</th>
              <th className="p-2 text-left">Actor</th>
              <th className="p-2 text-left">Meta</th>
              <th className="p-2 text-left">Detalle</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-4 text-center text-gray-500">No hay registros</td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="border-t align-top">
                  <td className="p-2">{new Date(r.createdAt).toLocaleString()}</td>
                  <td className="p-2 font-medium">{r.action}</td>
                  <td className="p-2 break-all"><code className="text-xs">{r.targetId ?? "-"}</code></td>
                  <td className="p-2">{r.actor ?? "-"}</td>
                  <td className="p-2"><div className="max-w-xs truncate">{typeof r.meta === "string" ? r.meta : JSON.stringify(r.meta ?? {})}</div></td>
                  <td className="p-2">
                    <button
                      onClick={() => setSelected(r)}
                      className="px-3 py-1 rounded bg-indigo-50 border text-sm"
                      aria-haspopup="dialog"
                      aria-controls="audit-detail-modal"
                    >
                      Ver detalle
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {selected && (
        <div
          role="dialog"
          id="audit-detail-modal"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
        >
          {/* backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setSelected(null)}
            aria-hidden
          />

          {/* panel */}
          <div
            className="relative bg-white rounded-lg shadow-lg w-full max-w-3xl mx-4 md:mx-0 my-6 md:my-0 overflow-auto"
            style={{ maxHeight: "85vh" }}
            role="document"
            aria-label={`Detalle de auditoría ${selected.action}`}
          >
            <div className="p-4 border-b flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold">Detalle — {selected.action}</h3>
                <div className="text-xs text-gray-500 mt-1">
                  {selected.actor ?? "-"} — {new Date(selected.createdAt).toLocaleString()}
                </div>
                <div className="text-xs text-gray-400 mt-1">Target: <code className="text-xs">{selected.targetId ?? "-"}</code></div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  ref={closeBtnRef}
                  onClick={() => setSelected(null)}
                  className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 text-sm"
                >
                  Cerrar
                </button>
              </div>
            </div>

            <div className="p-4">
              <h4 className="text-sm font-medium mb-2">Meta (payload)</h4>
              <div className="bg-slate-50 border rounded p-3 text-xs">
                <pre className="whitespace-pre-wrap break-words">
                  {JSON.stringify(selected.meta ?? {}, null, 2)}
                </pre>
              </div>

              {/* optional structured fields */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <h5 className="text-xs text-gray-500">ID</h5>
                  <div className="text-sm break-all">{selected.id}</div>
                </div>
                <div>
                  <h5 className="text-xs text-gray-500">Actor</h5>
                  <div className="text-sm">{selected.actor ?? "-"}</div>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => {
                    // copy meta to clipboard
                    navigator.clipboard?.writeText(JSON.stringify(selected.meta ?? {}, null, 2));
                    // feedback minimal
                    alert("Payload copiado al portapapeles");
                  }}
                  className="px-3 py-1 rounded bg-green-50 border text-sm"
                >
                  Copiar payload
                </button>
                <a
                  href={`/api/auditlogs?export=csv&limit=1&page=1&targetId=${encodeURIComponent(selected.id)}`}
                  className="px-3 py-1 rounded bg-indigo-50 border text-sm"
                >
                  Exportar (fila)
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
