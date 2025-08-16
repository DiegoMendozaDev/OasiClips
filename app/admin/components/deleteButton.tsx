// app/components/deleteButton.tsx
"use client";
import React, { useState } from "react";

export default function DeleteButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    const ok = confirm(
      "¿Seguro que quieres eliminar esta conversión? Esta acción no se puede deshacer."
    );
    if (!ok) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/conversions/${encodeURIComponent(id)}`, {
        method: "DELETE",
        credentials: "same-origin",
        headers: {
          Accept: "application/json",
        },
      });

      if (res.ok) {
        location.reload();
      } else if (res.status === 401) {
        alert("No autorizado. Vuelve a iniciar sesión.");
        location.href = "/admin";
      } else {
        const j = await res.json().catch(() => ({ error: "server" }));
        alert(`Error al borrar: ${j?.error ?? res.statusText}`);
      }
    } catch (err: any) {
      console.error("delete error", err);
      alert("Error de red al intentar eliminar. Revisa la consola.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      className="px-3 py-1 rounded bg-red-50 border text-sm"
      disabled={loading}
      aria-disabled={loading}
    >
      {loading ? "Eliminando..." : "Eliminar"}
    </button>
  );
}
