import test from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import {
  isValidSignature,
  formatBookingMessage,
  type InviteePayload,
} from "../netlify/functions/calendly-webhook.ts";

const KEY = "test_signing_key";

function sign(body: string, t = "1700000000"): string {
  const v1 = crypto.createHmac("sha256", KEY).update(`${t}.${body}`).digest("hex");
  return `t=${t},v1=${v1}`;
}

test("isValidSignature accepts a correctly signed body", () => {
  const body = JSON.stringify({ event: "invitee.created" });
  assert.equal(isValidSignature(sign(body), body, KEY), true);
});

test("isValidSignature rejects tampered body, bad sig, and missing header", () => {
  const body = JSON.stringify({ event: "invitee.created" });
  const header = sign(body);
  assert.equal(isValidSignature(header, body + "tampered", KEY), false);
  assert.equal(isValidSignature("t=1700000000,v1=deadbeef", body, KEY), false);
  assert.equal(isValidSignature(null, body, KEY), false);
  assert.equal(isValidSignature(header, body, undefined), false); // no signing key configured
});

test("formatBookingMessage includes the key invitee details", () => {
  const payload: InviteePayload = {
    name: "Jane Doe",
    email: "jane@example.com",
    text_reminder_number: "+15551234567",
    timezone: "America/New_York",
    scheduled_event: { name: "Clarity Session", start_time: "2026-07-01T15:00:00.000000Z" },
    questions_and_answers: [{ question: "Biggest hurdle?", answer: "Time management" }],
  };
  const msg = formatBookingMessage(payload);

  assert.match(msg, /Jane Doe/);
  assert.match(msg, /jane@example\.com/);
  assert.match(msg, /Phone: \+15551234567/);
  assert.match(msg, /Clarity Session/);
  assert.match(msg, /Notes: Biggest hurdle\?: Time management/);
  assert.match(msg, /America\/New_York/);
  assert.match(msg, /Jul 1, 2026/); // 15:00 UTC formatted in ET
});

test("formatBookingMessage degrades gracefully with a sparse payload", () => {
  const msg = formatBookingMessage({});
  assert.match(msg, /New booking:/);
  assert.match(msg, /Unknown — no email/);
  assert.match(msg, /time TBD/);
  assert.doesNotMatch(msg, /Phone:/);
  assert.doesNotMatch(msg, /Notes:/);
});
