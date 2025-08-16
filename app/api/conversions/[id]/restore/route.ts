// app/api/conversions/[id]/restore/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

function extractIdFromUrl(req: Request) {
  try {
    const url = new URL(req.url);
    const parts = url.pathname.split("/").filter(Boolean);
    // expected: ["api", "conversions", "<id>", "restore"]
    const idx = parts.indexOf("conversions");
    return idx >= 0 && parts.length > idx + 1 ? parts[idx + 1] : null;
  } catch {
    return null;
  }
}

function getActorFromAuthHeader(req: Request) {
  try {
    const auth = req.headers.get("authorization") || "";
    if (!auth.startsWith("Basic ")) return null;
    const b64 = auth.split(" ")[1];
    const decoded = typeof atob === "function" ? atob(b64) : Buffer.from(b64, "base64").toString("utf8");
    const [user] = decoded.split(":");
    return user || null;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  const id = extractIdFromUrl(req);
  if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  try {
    const existing = await prisma.conversion.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const actor = getActorFromAuthHeader(req) ?? process.env.ADMIN_BASIC_USER ?? "unknown";

    const restored = await prisma.conversion.update({
      where: { id },
      data: { deletedAt: null, deletedBy: null },
    });

    await prisma.auditLog.create({
      data: {
        action: "restore",
        targetId: id,
        actor,
        meta: { formId: existing.formId ?? null },
      },
    });

    return NextResponse.json({ ok: true, id });
  } catch (err) {
    console.error("[api/conversions restore] error:", err);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}
