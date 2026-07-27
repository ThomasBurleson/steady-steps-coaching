/**
 * POST /.netlify/functions/comment
 *   body: { slug, name, body, website }   (`website` is a honeypot — must be empty)
 *
 * Stores a new comment as `pending` (hidden from the public until approved) and
 * texts the coach a Twilio SMS containing the comment plus a one-tap approve
 * link. Reuses the same Twilio setup/env as the Calendly webhook.
 *
 * Env: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER,
 *      COACH_PHONE_NUMBER, ADMIN_TOKEN, SITE_URL (optional — falls back to the
 *      request origin).
 */
import twilio from "twilio";
import { newId, readComments, writeComments, type Comment } from "./_store";

const NAME_MAX = 80;
const BODY_MAX = 2000;

const {
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_FROM_NUMBER,
  COACH_PHONE_NUMBER,
  ADMIN_TOKEN,
} = process.env;

export default async (req: Request): Promise<Response> => {
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

  let body: { slug?: string; name?: string; body?: string; website?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Bad Request" }, 400);
  }

  // Honeypot: real users never fill this hidden field; bots do.
  if (body.website) return json({ ok: true }); // silently accept & drop

  const slug = body.slug?.trim();
  const name = body.name?.trim();
  const text = body.body?.trim();

  if (!slug) return json({ error: "Missing slug" }, 400);
  if (!name || name.length > NAME_MAX) return json({ error: "Invalid name" }, 400);
  if (!text || text.length > BODY_MAX) return json({ error: "Invalid comment" }, 400);

  const comment: Comment = {
    id: newId(),
    name,
    body: text,
    createdAt: new Date().toISOString(),
    status: "pending",
  };

  const comments = await readComments(slug);
  comments.push(comment);
  await writeComments(slug, comments);

  await notifyCoach(req, slug, comment);

  // Comment is held for moderation — deliberately not returned to the client.
  return json({ ok: true });
};

/** Text the coach the new comment with an approve link they can tap. */
async function notifyCoach(req: Request, slug: string, comment: Comment): Promise<void> {
  if (
    !TWILIO_ACCOUNT_SID ||
    !TWILIO_AUTH_TOKEN ||
    !TWILIO_FROM_NUMBER ||
    !COACH_PHONE_NUMBER ||
    !ADMIN_TOKEN
  ) {
    console.error("Twilio/ADMIN_TOKEN env vars missing; comment saved but no SMS sent.");
    return;
  }

  const origin = process.env.SITE_URL || new URL(req.url).origin;
  const params = new URLSearchParams({
    slug,
    id: comment.id,
    action: "approve",
    token: ADMIN_TOKEN,
  });
  const approveUrl = `${origin}/.netlify/functions/moderate?${params.toString()}`;

  const message = [
    `New blog comment (${slug}) — pending:`,
    `${comment.name}: ${comment.body}`,
    `Approve: ${approveUrl}`,
  ].join("\n");

  try {
    const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
    await client.messages.create({
      to: COACH_PHONE_NUMBER,
      from: TWILIO_FROM_NUMBER,
      body: message,
    });
  } catch (err) {
    // Don't fail the submission over a Twilio hiccup — the comment is saved and
    // can still be approved later.
    console.error("Twilio send failed:", err);
  }
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
