// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const config = {
  matcher: [
    "/admin/:path*",
    "/admin",
    "/api/conversions/:path*",
    "/api/conversions",
  ],
};

const ADMIN_USER = process.env.ADMIN_BASIC_USER;
const ADMIN_PASS = process.env.ADMIN_BASIC_PASS;

function unauthorizedResponse() {
  return new Response("Unauthorized", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Admin area"' },
  });
}

function configMissingResponse() {
  return new Response(
    "Admin basic credentials are not configured on the server.",
    {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    }
  );
}

export function middleware(req: NextRequest) {
  // If credentials not configured, block and make it explicit (safer than allowing)
  if (!ADMIN_USER || !ADMIN_PASS) {
    return configMissingResponse();
  }

  const auth = req.headers.get("authorization");
  if (!auth || !auth.startsWith("Basic ")) {
    return unauthorizedResponse();
  }

  const b64 = auth.split(" ")[1] ?? "";
  let decoded = "";
  try {
    decoded =
      typeof atob === "function"
        ? atob(b64)
        : Buffer.from(b64, "base64").toString("utf8");
  } catch {
    return unauthorizedResponse();
  }

  const [user, pass] = decoded.split(":");
  if (user === ADMIN_USER && pass === ADMIN_PASS) {
    return NextResponse.next();
  }

  return unauthorizedResponse();
}
