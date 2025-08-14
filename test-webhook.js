// test-webhook.js
const crypto = require("crypto");
const fetch = globalThis.fetch || require("node-fetch"); // node 18+ ya tiene fetch

const secret =
  "5e2d790ab212414d9bbd11025bd8e5cfc41f9dd99c8f85e79475c8cee8c1e751";
const payload = {
  event_type: "form_response",
  form_response: {
    form_id: "abc123",
    submitted_at: "2025-08-14T12:00:00Z",
    answers: [],
  },
};
const raw = JSON.stringify(payload);

// HMAC-SHA256 base64
const sig = crypto
  .createHmac("sha256", secret)
  .update(raw, "utf8")
  .digest("base64");

(async () => {
  const res = await fetch("http://localhost:3000/api/typeform-webhook", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Typeform-Signature": sig,
    },
    body: raw,
  });
  console.log("status", res.status);
  console.log(await res.text());
})();
