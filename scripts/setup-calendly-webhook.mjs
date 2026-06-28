#!/usr/bin/env node
/**
 * One-time setup: create the Calendly `invitee.created` webhook subscription
 * that points at the deployed Netlify function.
 *
 * Requires a PAID Calendly plan (webhooks are not available on the free tier).
 *
 * Usage:
 *   CALENDLY_PAT=eyJ... \
 *   WEBHOOK_URL=https://<your-site>.netlify.app/.netlify/functions/calendly-webhook \
 *   node scripts/setup-calendly-webhook.mjs [--scope user|organization]
 *
 * On success it prints a generated signing key — copy it into the
 * CALENDLY_WEBHOOK_SIGNING_KEY env var in Netlify (and your local .env), because
 * the function verifies every webhook signature against it.
 *
 * Get a Personal Access Token at:
 *   Calendly → Integrations & apps → API & webhooks → Personal access tokens
 */
import crypto from "node:crypto";

const API = "https://api.calendly.com";

function fail(msg) {
  console.error(`\n✖ ${msg}\n`);
  process.exit(1);
}

const PAT = process.env.CALENDLY_PAT;
const WEBHOOK_URL = process.env.WEBHOOK_URL;
const scopeArgIdx = process.argv.indexOf("--scope");
const scope = scopeArgIdx !== -1 ? process.argv[scopeArgIdx + 1] : "user";

if (!PAT) fail("Set CALENDLY_PAT (your Calendly Personal Access Token).");
if (!WEBHOOK_URL) fail("Set WEBHOOK_URL (the deployed function URL).");
if (!["user", "organization"].includes(scope)) fail(`Invalid --scope "${scope}".`);

const auth = { Authorization: `Bearer ${PAT}`, "Content-Type": "application/json" };

async function api(path, init) {
  const res = await fetch(`${API}${path}`, { ...init, headers: { ...auth, ...init?.headers } });
  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { raw: text };
  }
  if (!res.ok) {
    fail(`${init?.method ?? "GET"} ${path} → ${res.status}\n${JSON.stringify(json, null, 2)}`);
  }
  return json;
}

console.log("→ Looking up your Calendly account…");
const me = await api("/users/me");
const userUri = me.resource?.uri;
const orgUri = me.resource?.current_organization;
if (!userUri || !orgUri) fail(`Unexpected /users/me response:\n${JSON.stringify(me, null, 2)}`);
console.log(`  user:         ${userUri}`);
console.log(`  organization: ${orgUri}`);

const signingKey = crypto.randomBytes(32).toString("hex");

const body = {
  url: WEBHOOK_URL,
  events: ["invitee.created"],
  organization: orgUri,
  scope,
  signing_key: signingKey,
};
// "user" scope only fires for your own bookings and requires the user URI too.
if (scope === "user") body.user = userUri;

console.log(`\n→ Creating webhook subscription (scope: ${scope})…`);
const created = await api("/webhook_subscriptions", { method: "POST", body: JSON.stringify(body) });

console.log("\n✓ Webhook subscription created.");
console.log(`  subscription: ${created.resource?.uri ?? "(see response)"}`);
console.log(`  callback URL: ${WEBHOOK_URL}`);
console.log(`  events:       invitee.created`);

console.log("\n──────────────────────────────────────────────────────────────");
console.log("  Set this as CALENDLY_WEBHOOK_SIGNING_KEY (Netlify + local .env):");
console.log(`\n  ${signingKey}\n`);
console.log("  The function rejects any webhook whose signature doesn't match it.");
console.log("──────────────────────────────────────────────────────────────\n");
