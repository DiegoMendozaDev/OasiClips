// app/admin/page.tsx
import React from "react";
import prisma from "@/lib/prisma";

type ConversionRow = {
  id: string;
  formId: string | null;
  submittedAt: Date | null;
  answersCount: number;
  createdAt: Date;
  deletedAt: Date | null;
};

async function getConversions({
  limit = 100,
  page = 1,
  search,
  showDeleted = false,
}: {
  limit?: number;
  page?: number;
  search?: string | null;
  showDeleted?: boolean;
}) {
  const skip = (page - 1) * limit;
  const where: any = {};

  if (!showDeleted) {
    // only non-deleted
    where.deletedAt = null;
  }

  if (search) {
    const s = search.trim();
    if (s.length) {
      where.OR = [
        { formId: { contains: s } },
        { responseToken: { contains: s } },
        // you can add other searchable fields here
      ];
    }
  }

  const [rows, total] = await Promise.all([
    prisma.conversion.findMany({
      where: Object.keys(where).length ? where : undefined,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      select: {
        id: true,
        formId: true,
        submittedAt: true,
        answersCount: true,
        createdAt: true,
        deletedAt: true,
      },
    }),
    prisma.conversion.count({
      where: Object.keys(where).length ? where : undefined,
    }),
  ]);

  return { rows: rows as ConversionRow[], total };
}

export default async function AdminPage({
  searchParams,
}: {
  // Next 15 expects searchParams to be a Promise or undefined
  searchParams?: Promise<{
    page?: string;
    limit?: string;
    search?: string;
    showDeleted?: string;
  }>;
}) {
  // await the promise only if present
  const params = searchParams ? await searchParams : undefined;

  const page = Math.max(1, Number(params?.page ?? 1));
  const limit = Math.min(500, Math.max(5, Number(params?.limit ?? 100)));
  const search = params?.search?.trim() || undefined;
  const showDeleted =
    params?.showDeleted === "1" ||
    params?.showDeleted === "true" ||
    params?.showDeleted === "yes";

  const { rows, total } = await getConversions({
    limit,
    page,
    search,
    showDeleted,
  });
  const pages = Math.max(1, Math.ceil(total / limit));

  const buildUrl = (
    path: string,
    extra?: Record<string, string | number | undefined>
  ) => {
    const url = new URL(path, "http://example.local");
    if (search) url.searchParams.set("search", search);
    if (showDeleted) url.searchParams.set("showDeleted", "1");
    url.searchParams.set("page", String(extra?.page ?? page));
    url.searchParams.set("limit", String(limit));
    return url.pathname + "?" + url.searchParams.toString();
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Conversions (admin)</h1>
          <div>
            <a
              href={`/api/conversions?export=csv&limit=${limit}&page=${page}${
                search ? `&search=${encodeURIComponent(search)}` : ""
              }${showDeleted ? `&showDeleted=1` : ""}`}
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
            name="search"
            defaultValue={search ?? ""}
            placeholder="Buscar por formId / token"
            className="px-3 py-2 border rounded"
          />
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 flex items-center gap-2">
              <input
                type="checkbox"
                name="showDeleted"
                defaultChecked={showDeleted}
                value="1"
              />
              Mostrar eliminados
            </label>
          </div>
          <input
            name="limit"
            defaultValue={String(limit)}
            className="w-24 px-2 py-2 border rounded"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-3 py-2 rounded bg-indigo-600 text-white text-sm"
            >
              Filtrar
            </button>
          </div>
        </form>

        <div className="mb-3 text-sm text-gray-600">
          Mostrando {rows.length} de {total} — página {page} de {pages}
        </div>

        <div className="overflow-x-auto bg-white border rounded shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">Created</th>
                <th className="p-2 text-left">Form</th>
                <th className="p-2 text-left">Submitted</th>
                <th className="p-2 text-left">Answers</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-gray-500">
                    No hay conversions
                  </td>
                </tr>
              ) : (
                rows.map((c) => (
                  <tr key={c.id} className="border-t align-top">
                    <td className="p-2">
                      {new Date(c.createdAt).toLocaleString()}
                    </td>
                    <td className="p-2 break-all">
                      <code className="text-xs">{c.formId ?? "-"}</code>
                    </td>
                    <td className="p-2">
                      {c.submittedAt
                        ? new Date(c.submittedAt).toLocaleString()
                        : "-"}
                    </td>
                    <td className="p-2">{c.answersCount}</td>
                    <td className="p-2">
                      {c.deletedAt ? (
                        <span className="text-red-600">Deleted</span>
                      ) : (
                        <span className="text-green-600">Active</span>
                      )}
                    </td>
                    <td className="p-2">
                      {c.deletedAt ? (
                        <form
                          method="post"
                          action={`/api/conversions/${encodeURIComponent(
                            c.id
                          )}/restore`}
                          style={{ display: "inline" }}
                        >
                          <button
                            type="submit"
                            className="px-3 py-1 rounded bg-green-50 border text-sm"
                          >
                            Restaurar
                          </button>
                        </form>
                      ) : (
                        <form
                          method="post"
                          action={`/api/conversions/${encodeURIComponent(
                            c.id
                          )}/delete`}
                          style={{ display: "inline" }}
                        >
                          <button
                            type="submit"
                            className="px-3 py-1 rounded bg-red-50 border text-sm"
                          >
                            Eliminar
                          </button>
                        </form>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Página {page} / {pages}
          </div>
          <div className="flex gap-2">
            <a
              href={buildUrl("/admin", { page: Math.max(1, page - 1) })}
              className={`px-3 py-1 rounded border text-sm ${
                page === 1 ? "opacity-50 pointer-events-none" : ""
              }`}
            >
              Anterior
            </a>
            <a
              href={buildUrl("/admin", { page: Math.min(pages, page + 1) })}
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
