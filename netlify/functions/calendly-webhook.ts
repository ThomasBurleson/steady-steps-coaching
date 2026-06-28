/**
 * Calendly `invitee.created` webhook → Twilio SMS to the coach.
 *
 * Calendly POSTs here in real time when someone books. We verify the request
 * signature, extract the invitee details from the payload, and text the coach.
 *
 * Required env vars (set in Netlify → Site settings → Environment variables):
 *   CALENDLY_WEBHOOK_SIGNING_KEY  — returned when the webhook subscription is created
 *   TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN
 *   TWILIO_FROM_NUMBER            — a Twilio number, E.164 (e.g. +15555550123)
 *   COACH_PHONE_NUMBER           — where to send the alert, E.164
 *   COACH_TIMEZONE (optional)    — IANA tz for formatting the time; defaults to the invitee's
 *
 * Endpoint (default Netlify path): /.netlify/functions/calendly-webhook
 */
import crypto from "node:crypto";
import twilio from "twilio";

const {
  CALENDLY_WEBHOOK_SIGNING_KEY,
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_FROM_NUMBER,
  COACH_PHONE_NUMBER,
  COACH_TIMEZONE,
} = process.env;

/** Shape of the fields we read from a Calendly `invitee.created` payload. */
export interface InviteePayload {
  name?: string;
  email?: string;
  text_reminder_number?: string;
  timezone?: string;
  scheduled_event?: { name?: string; start_time?: string };
  questions_and_answers?: Array<{ question?: string; answer?: string }>;
}

/** Build the SMS body sent to the coach from a booking payload. */
export function formatBookingMessage(p: InviteePayload, tzOverride?: string): string {
  const tz = tzOverride || p.timezone || "UTC";
  const when = p.scheduled_event?.start_time
    ? new Date(p.scheduled_event.start_time).toLocaleString("en-US", {
        timeZone: tz,
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "time TBD";

  const qa = Array.isArray(p.questions_and_answers)
    ? p.questions_and_answers
        .filter((x) => x.answer)
        .map((x) => `${x.question}: ${x.answer}`)
        .join(" | ")
    : "";

  return [
    `New booking${p.scheduled_event?.name ? ` (${p.scheduled_event.name})` : ""}:`,
    `${p.name ?? "Unknown"} — ${p.email ?? "no email"}`,
    p.text_reminder_number ? `Phone: ${p.text_reminder_number}` : null,
    `When: ${when} (${tz})`,
    qa ? `Notes: ${qa}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

/** Verify Calendly's `Calendly-Webhook-Signature: t=<ts>,v1=<hmac>` header. */
export function isValidSignature(
  header: string | null,
  rawBody: string,
  signingKey = CALENDLY_WEBHOOK_SIGNING_KEY,
): boolean {
  if (!signingKey || !header) return false;
  const parts = Object.fromEntries(
    header.split(",").map((kv) => {
      const [k, v] = kv.split("=");
      return [k?.trim(), v?.trim()];
    }),
  ) as { t?: string; v1?: string };
  if (!parts.t || !parts.v1) return false;

  const expected = crypto
    .createHmac("sha256", signingKey)
    .update(`${parts.t}.${rawBody}`)
    .digest("hex");

  const a = Buffer.from(expected);
  const b = Buffer.from(parts.v1);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export default async (req: Request): Promise<Response> => {
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

  const rawBody = await req.text();
  if (!isValidSignature(req.headers.get("calendly-webhook-signature"), rawBody)) {
    return new Response("Invalid signature", { status: 401 });
  }

  let body: { event?: string; payload?: Record<string, unknown> };
  try {
    body = JSON.parse(rawBody);
  } catch {
    return new Response("Bad Request", { status: 400 });
  }

  // Acknowledge any non-booking event so Calendly doesn't retry.
  if (body.event !== "invitee.created") return new Response("Ignored", { status: 200 });

  const message = formatBookingMessage((body.payload ?? {}) as InviteePayload, COACH_TIMEZONE);

  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_FROM_NUMBER || !COACH_PHONE_NUMBER) {
    console.error("Twilio env vars missing; cannot send SMS.");
    return new Response("Server not configured", { status: 500 });
  }

  try {
    const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
    await client.messages.create({
      to: COACH_PHONE_NUMBER,
      from: TWILIO_FROM_NUMBER,
      body: message,
    });
  } catch (err) {
    // Log and still return 200 so Calendly doesn't retry-storm over a Twilio hiccup.
    console.error("Twilio send failed:", err);
    return new Response("SMS send failed", { status: 200 });
  }

  return new Response("OK", { status: 200 });
};
