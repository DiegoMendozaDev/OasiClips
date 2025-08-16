// app/api/conversions/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams;

  const page = Math.max(1, Number(q.get("page") || "1"));
  const limit = Math.min(500, Math.max(1, Number(q.get("limit") || "50")));
  const skip = (page - 1) * limit;
  const search = q.get("search")?.trim() || null;
  const exportFormat = q.get("export")?.toLowerCase() || null;
  const showDeleted = q.get("showDeleted") === "true";

  try {
    const where: any = {};

    if (!showDeleted) {
      // por defecto solo filas activas
      where.deletedAt = null;
    }

    if (search) {
      where.OR = [
        { id: { contains: search } },
        { formId: { contains: search } },
        { eventId: { contains: search } },
      ];
    }

    const [results, total] = await Promise.all([
      prisma.conversion.findMany({
        where: Object.keys(where).length ? where : undefined,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          formId: true,
          eventId: true,
          responseToken: true,
          submittedAt: true,
          answersCount: true,
          hidden: true,
          createdAt: true,
          deletedAt: true,
          deletedBy: true,
        },
      }),
      prisma.conversion.count({
        where: Object.keys(where).length ? where : undefined,
      }),
    ]);

    // CSV export
    if (exportFormat === "csv") {
      const header = [
        "id",
        "formId",
        "submittedAt",
        "answersCount",
        "createdAt",
        "deletedAt",
        "deletedBy",
      ].join(",");
      const rows = results.map((r) =>
        [
          `"${r.id}"`,
          `"${(r.formId ?? "").replace(/"/g, '""')}"`,
          `"${r.submittedAt ? new Date(r.submittedAt).toISOString() : ""}"`,
          `${r.answersCount}`,
          `"${r.createdAt.toISOString()}"`,
          `"${r.deletedAt ? new Date(r.deletedAt).toISOString() : ""}"`,
          `"${(r.deletedBy ?? "").replace(/"/g, '""')}"`,
        ].join(",")
      );
      const csv = [header, ...rows].join("\n");
      return new Response(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="conversions-page-${page}.csv"`,
        },
      });
    }

    return NextResponse.json({
      ok: true,
      meta: { total, page, limit, pages: Math.ceil(total / limit) },
      results,
    });
  } catch (err) {
    console.error("[api/conversions] error:", err);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}
