// app/api/conversions/[id]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

function extractIdFromUrl(req: Request) {
  try {
    const url = new URL(req.url);
    const parts = url.pathname.split("/").filter(Boolean);
    // ["api", "conversions", "<id>"]
    return parts[parts.length - 1] ?? null;
  } catch {
    return null;
  }
}

function getActorFromAuthHeader(req: Request) {
  try {
    const auth = req.headers.get("authorization") || "";
    if (!auth.startsWith("Basic ")) return null;
    const b64 = auth.split(" ")[1];
    const decoded =
      typeof atob === "function"
        ? atob(b64)
        : Buffer.from(b64, "base64").toString("utf8");
    const [user] = decoded.split(":");
    return user || null;
  } catch {
    return null;
  }
}

export async function DELETE(req: Request) {
  const id = extractIdFromUrl(req);
  if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  try {
    const existing = await prisma.conversion.findUnique({ where: { id } });
    if (!existing)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    const actor =
      getActorFromAuthHeader(req) ?? process.env.ADMIN_BASIC_USER ?? "unknown";

    const updated = await prisma.conversion.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy: actor,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "soft_delete",
        targetId: id,
        actor,
        meta: {
          formId: existing.formId ?? null,
          answersCount: existing.answersCount ?? 0,
        },
      },
    });

    return NextResponse.json({ ok: true, id });
  } catch (err) {
    console.error("[api/conversions DELETE soft] error:", err);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

// Support POST with _method=DELETE for HTML forms
export async function POST(req: Request) {
  const ct = req.headers.get("content-type") || "";
  let methodOverride = null;
  if (ct.includes("application/x-www-form-urlencoded") || ct.includes("form")) {
    const text = await req.text();
    const params = new URLSearchParams(text);
    methodOverride = params.get("_method");
  } else if (ct.includes("application/json")) {
    try {
      const body = await req.json();
      methodOverride = body?._method ?? null;
    } catch {}
  } else {
    try {
      const url = new URL(req.url);
      methodOverride = url.searchParams.get("_method");
    } catch {}
  }

  if (methodOverride && methodOverride.toUpperCase() === "DELETE") {
    return DELETE(req);
  }

  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}
