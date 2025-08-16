// app/api/auditlogs/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const q = url.searchParams;

    const page = Math.max(1, Number(q.get("page") || "1"));
    const limit = Math.min(500, Math.max(5, Number(q.get("limit") || "50")));
    const skip = (page - 1) * limit;

    const action = q.get("action")?.trim() || null;
    const actor = q.get("actor")?.trim() || null;
    const targetId = q.get("targetId")?.trim() || null;
    const start = q.get("start") ? new Date(q.get("start") as string) : null;
    const end = q.get("end") ? new Date(q.get("end") as string) : null;
    const exportFormat = q.get("export")?.toLowerCase() || null;

    const where: any = {};

    if (action) where.action = { contains: action };
    if (actor) where.actor = { contains: actor };
    if (targetId) where.targetId = { contains: targetId };

    if (start || end) {
      where.createdAt = {};
      if (start) where.createdAt.gte = start;
      if (end) where.createdAt.lte = end;
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
      prisma.auditLog.count({ where: Object.keys(where).length ? where : undefined }),
    ]);

    if (exportFormat === "csv") {
      // Simple CSV (careful with large exports). Escape quotes.
      const header = ["id", "action", "targetId", "actor", "meta", "createdAt"].join(",");
      const rowsCsv = rows.map((r) =>
        [
          `"${r.id}"`,
          `"${(r.action ?? "").replace(/"/g, '""')}"`,
          `"${(r.targetId ?? "").replace(/"/g, '""')}"`,
          `"${(r.actor ?? "").replace(/"/g, '""')}"`,
          `"${JSON.stringify(r.meta ?? {}).replace(/"/g, '""')}"`,
          `"${r.createdAt.toISOString()}"`,
        ].join(",")
      );
      const csv = [header, ...rowsCsv].join("\n");
      return new Response(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="auditlogs-page-${page}.csv"`,
        },
      });
    }

    return NextResponse.json({
      ok: true,
      meta: { total, page, limit, pages: Math.ceil(total / limit) },
      results: rows,
    });
  } catch (err) {
    console.error("[api/auditlogs] error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
