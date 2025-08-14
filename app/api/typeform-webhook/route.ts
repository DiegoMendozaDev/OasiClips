// app/api/typeform-webhook/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";

export const runtime = "nodejs"; // <-- CORREGIDO: 'nodejs' es el valor válido

const TYPEFORM_SECRET = process.env.TYPEFORM_WEBHOOK_SECRET || "";
const GA4_MEASUREMENT_ID = process.env.GA4_MEASUREMENT_ID || "";
const GA4_API_SECRET = process.env.GA4_API_SECRET || "";

function safeCompare(a: string, b: string) {
  try {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

async function sendToGA4(eventName: string, params: Record<string, any>) {
  if (!GA4_MEASUREMENT_ID || !GA4_API_SECRET) {
    return false;
  }

  // client_id: use crypto.randomUUID if available, otherwise fallback to timestamp+random
  let client_id: string;
  try {
    client_id = (crypto as any).randomUUID
      ? (crypto as any).randomUUID()
      : `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
  } catch {
    client_id = `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
  }

  const url = `https://www.google-analytics.com/mp/collect?measurement_id=${encodeURIComponent(
    GA4_MEASUREMENT_ID
  )}&api_secret=${encodeURIComponent(GA4_API_SECRET)}`;

  const body = {
    client_id,
    events: [
      {
        name: eventName,
        params,
      },
    ],
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return res.ok;
  } catch (err) {
    console.error("GA4 send error", err);
    return false;
  }
}

function signatureMatches(
  secret: string,
  rawBody: string,
  headerValue: string | null
) {
  if (!headerValue) return false;
  const cleaned = headerValue
    .replace(/^sha256=|^SHA256=|^sha1=|^hmac-sha256=/i, "")
    .trim();

  const hmac = crypto.createHmac("sha256", secret).update(rawBody).digest();
  const hex = hmac.toString("hex");
  const b64 = hmac.toString("base64");

  if (safeCompare(cleaned, hex)) return true;
  if (safeCompare(cleaned, b64)) return true;
  return false;
}

export async function POST(req: Request) {
  if (req.method !== "POST") {
    return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
  }

  // read raw body as text for signature verification
  const raw = await req.text();

  // optional signature check
  if (TYPEFORM_SECRET) {
    const headerValue =
      req.headers.get("Typeform-Signature") ||
      req.headers.get("typeform-signature") ||
      req.headers.get("x-typeform-signature");

    const ok = signatureMatches(TYPEFORM_SECRET, raw, headerValue);
    if (!ok) {
      console.warn("[typeform-webhook] signature mismatch");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  }

  let payload: any;
  try {
    payload = JSON.parse(raw);
  } catch (err) {
    console.warn("[typeform-webhook] invalid json", err);
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const eventType = payload.event_type || payload.event || "unknown";
  const formResponse = payload.form_response ?? payload;
  const formId = formResponse?.form_id ?? payload?.form_id ?? null;
  const answers = formResponse?.answers ?? [];
  const hidden = formResponse?.hidden ?? {};
  const submittedAt = formResponse?.submitted_at ?? new Date().toISOString();

  const conversion = {
    source: "typeform",
    eventType,
    formId,
    submittedAt,
    hidden,
    answersSummary: Array.isArray(answers)
      ? answers.map((a: any) => ({
          fieldId: a.field?.id ?? a.field_id ?? null,
          type: a.type ?? null,
          text:
            a.text ?? a.choice?.label ?? a.email ?? a.url ?? a.number ?? null,
        }))
      : [],
  };

  console.info("[typeform-webhook] conversion received:", {
    formId,
    submittedAt,
    eventType,
    hiddenKeys: Object.keys(hidden || {}),
  });

  try {
    await sendToGA4("cta_conversion", {
      form_id: formId,
      event_type: eventType,
      submitted_at: submittedAt,
      answers_count: Array.isArray(answers) ? answers.length : 0,
      ...hidden,
    });
  } catch (e) {
    console.error("Error sending to GA4:", e);
  }

  // TODO: persist to DB if needed

  return NextResponse.json({ success: true });
}
