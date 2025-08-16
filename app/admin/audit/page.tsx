// app/admin/audit/page.tsx
import React from "react";
import prisma from "@/lib/prisma";
import AuditTableClient, { AuditRowSerializable } from "./auditTableClient";

type AuditRow = {
  id: string;
  action: string;
  targetId?: string | null;
  actor?: string | null;
  meta?: any;
  createdAt: Date;
};

async function getAuditLogs(
  limit = 50,
  page = 1,
  filters?: {
    action?: string;
    actor?: string;
    targetId?: string;
    start?: string;
    end?: string;
  }
) {
  const skip = (page - 1) * limit;
  const where: any = {};

  if (filters?.action) where.action = { contains: filters.action };
  if (filters?.actor) where.actor = { contains: filters.actor };
  if (filters?.targetId) where.targetId = { contains: filters.targetId };

  if (filters?.start || filters?.end) {
    where.createdAt = {};
    if (filters?.start) {
      const s = new Date(filters.start);
      if (!Number.isNaN(s.getTime())) where.createdAt.gte = s;
    }
    if (filters?.end) {
      const e = new Date(filters.end);
      if (!Number.isNaN(e.getTime())) where.createdAt.lte = e;
    }
  }

  const [rows, total] = await Promise.all([
    prisma.auditLog.findMany({
      where: Object.keys(where).length ? where : undefined,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      select: {
        id: true,
        action: true,
        targetId: true,
        actor: true,
        meta: true,
        createdAt: true,
      },
    }),
    prisma.auditLog.count({
      where: Object.keys(where).length ? where : undefined,
    }),
  ]);

  return { rows: rows as AuditRow[], total };
}

export default async function AuditPage({
  // Important: Next 15 expects searchParams to be a Promise or undefined
  searchParams,
}: {
  searchParams?: Promise<{
    page?: string;
    limit?: string;
    action?: string;
    actor?: string;
    targetId?: string;
    start?: string;
    end?: string;
  }>;
}) {
  // await only if searchParams exists
  const params = searchParams ? await searchParams : undefined;

  const page = Math.max(1, Number(params?.page ?? 1));
  const limit = Math.min(200, Math.max(5, Number(params?.limit ?? 50)));
  const action = params?.action?.trim() || undefined;
  const actor = params?.actor?.trim() || undefined;
  const targetId = params?.targetId?.trim() || undefined;
  const start = params?.start || undefined;
  const end = params?.end || undefined;

  const { rows: logs, total } = await getAuditLogs(limit, page, {
    action,
    actor,
    targetId,
    start,
    end,
  });
  const pages = Math.max(1, Math.ceil(total / limit));

  // serialize rows for client (dates -> ISO)
  const rowsSerialized: AuditRowSerializable[] = logs.map((r) => ({
    id: r.id,
    action: r.action,
    targetId: r.targetId ?? null,
    actor: r.actor ?? null,
    meta: r.meta ?? {},
    createdAt: r.createdAt.toISOString(),
  }));

  const buildUrl = (
    path: string,
    extra?: Record<string, string | number | undefined>
  ) => {
    const url = new URL(path, "http://example.local");
    if (action) url.searchParams.set("action", action);
    if (actor) url.searchParams.set("actor", actor);
    if (targetId) url.searchParams.set("targetId", targetId);
    if (start) url.searchParams.set("start", start);
    if (end) url.searchParams.set("end", end);
    url.searchParams.set("page", String(extra?.page ?? page));
    url.searchParams.set("limit", String(limit));
    return url.pathname + "?" + url.searchParams.toString();
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Audit Log</h1>
          <div>
            <a
              href={`/api/auditlogs?export=csv&limit=${limit}&page=${page}${
                action ? `&action=${encodeURIComponent(action)}` : ""
              }${actor ? `&actor=${encodeURIComponent(actor)}` : ""}${
                targetId ? `&targetId=${encodeURIComponent(targetId)}` : ""
              }${start ? `&start=${encodeURIComponent(start)}` : ""}${
                end ? `&end=${encodeURIComponent(end)}` : ""
              }`}
              className="px-3 py-1 rounded bg-green-50 border text-sm"
            >
              Export CSV
            </a>
          </div>
        </header>

        <form
          method="get"
          className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-2"
        >
          <input
            name="action"
            defaultValue={action ?? ""}
            placeholder="Action (e.g. soft_delete)"
            className="px-3 py-2 border rounded"
          />
          <input
            name="actor"
            defaultValue={actor ?? ""}
            placeholder="Actor (admin user)"
            className="px-3 py-2 border rounded"
          />
          <input
            name="targetId"
            defaultValue={targetId ?? ""}
            placeholder="Target ID"
            className="px-3 py-2 border rounded"
          />
          <div className="flex gap-2">
            <input
              name="start"
              type="date"
              defaultValue={start ?? ""}
              className="px-3 py-2 border rounded"
            />
            <input
              name="end"
              type="date"
              defaultValue={end ?? ""}
              className="px-3 py-2 border rounded"
            />
            <input
              name="limit"
              defaultValue={String(limit)}
              className="w-20 px-2 py-2 border rounded"
            />
            <button
              type="submit"
              className="px-3 py-2 rounded bg-indigo-600 text-white text-sm"
            >
              Filtrar
            </button>
          </div>
        </form>

        <div className="mb-3 text-sm text-gray-600">
          Mostrando {logs.length} de {total} registros — página {page} de{" "}
          {pages}
        </div>

        {/* Client table & modal */}
        <AuditTableClient rows={rowsSerialized} />

        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Página {page} / {pages}
          </div>
          <div className="flex gap-2">
            <a
              href={buildUrl("/admin/audit", { page: Math.max(1, page - 1) })}
              className={`px-3 py-1 rounded border text-sm ${
                page === 1 ? "opacity-50 pointer-events-none" : ""
              }`}
            >
              Anterior
            </a>
            <a
              href={buildUrl("/admin/audit", {
                page: Math.min(pages, page + 1),
              })}
              className={`px-3 py-1 rounded border text-sm ${
                page === pages ? "opacity-50 pointer-events-none" : ""
              }`}
            >
              Siguiente
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
