# Contact → Calendly booking flow

End-to-end reference for how a visitor goes from a "Book a Call" CTA to a booked
Clarity session, and what the coach receives.

Related docs:

- [`calendly-sms-setup.md`](./calendly-sms-setup.md) — the backend half (Calendly
  webhook → Netlify Function → Twilio SMS), including one-time setup order.
- [`../src/app/calendly/README.md`](../src/app/calendly/README.md) — provider API,
  code-adjacent.

---

## The flow

Booking is **form-first**: no CTA opens Calendly directly. Every "Book a Call"
navigates to the `/contact` route, and *submitting the intake form* is what
opens the scheduler. This captures the coaching intake answers (primary areas,
biggest hurdle) even if the visitor never picks a time.

```
"Book a Call"  (home/Header.tsx, blog/Header.tsx)
      │  TanStack Router navigate → /contact
      ▼
Intake form (contact/Contact.tsx) ── submit ──▶ POST / with form-name=contact
      │                                          (Netlify Forms)
      │ on success: openCalendly({ prefill: {name, email}, onClose })
      ▼
Calendly PopupModal (prefilled, brand-themed)
      ├─ visitor schedules → onEventScheduled
      │      ├─ background POST / with form-name=booking   (lead record)
      │      └─ Calendly fires invitee.created webhook ──▶ Netlify Function
      │                                                     └─▶ Twilio SMS to coach
      ▼
popup closes → onClose(booked)
      ▼
Contact success view
      ├─ booked      → "Your session is booked!"
      └─ not booked  → "Your request has been submitted!"
```

Because the intake POST happens **before** the scheduler opens, closing the
popup without booking is still a captured lead — hence the "we'll be in touch"
copy in that branch.

## Pieces

| File | Role |
| --- | --- |
| [`src/app/home/Header.tsx`](../src/app/home/Header.tsx) | Homepage "Book a Call" CTAs (desktop + mobile menu) → `/contact`. |
| [`src/app/blog/Header.tsx`](../src/app/blog/Header.tsx) | Blog "Book a Call" → `/contact`; hidden when already on that page. |
| [`src/routes/contact.tsx`](../src/routes/contact.tsx) | The `/contact` route: page chrome + SEO, wraps `<Contact>` in `<CalendlyProvider>`. |
| [`src/app/contact/Contact.tsx`](../src/app/contact/Contact.tsx) | Owns the flow — opens the prefilled scheduler on submit success, renders the success view on close. |
| [`src/app/contact/Contact.hook.ts`](../src/app/contact/Contact.hook.ts) | Zod schema + react-hook-form wiring; POSTs the intake to Netlify Forms. |
| [`src/app/calendly/CalendlyProvider.tsx`](../src/app/calendly/CalendlyProvider.tsx) | Renders the shared `PopupModal`; exposes `openCalendly()` via context; fires the background booking POST. |
| [`index.html`](../index.html) | Hidden `contact` and `booking` forms so Netlify recognizes both POSTs at build time. |
| [`netlify/functions/calendly-webhook.ts`](../netlify/functions/calendly-webhook.ts) | Verifies the Calendly signature and texts the coach via Twilio. |

`CalendlyProvider` deliberately wraps **only** `<Contact>` rather than the whole
app, so `react-calendly` is code-split into the `/contact` chunk and stays out of
the homepage bundle. The modal still overlays the full page — its `rootElement`
targets `#root`.

## Two POSTs, two purposes

Both go to Netlify Forms and are keyed by the hidden forms in `index.html`:

| `form-name` | When | Contains |
| --- | --- | --- |
| `contact` | Intake form submit, before the scheduler opens | Name, email, phone, and the two open-ended answers |
| `booking` | A slot is actually scheduled | Event URI, invitee URI, timestamp |

The free Calendly embed's `onEventScheduled` only exposes **event and invitee
URIs**, not the visitor's details — which is fine, since the intake form already
captured them. The coach's real-time SMS with full booking details comes from
the webhook backend (paid Calendly plan), not the embed.

## Configuration

| Var | Needed for |
| --- | --- |
| `VITE_CALENDLY_URL` | The popup. **Frontend — must keep the `VITE_` prefix.** |
| `CALENDLY_WEBHOOK_SIGNING_KEY`, `TWILIO_*`, `COACH_PHONE_NUMBER`, `COACH_TIMEZONE` | The SMS backend — see [`calendly-sms-setup.md`](./calendly-sms-setup.md). |

```
VITE_CALENDLY_URL=https://calendly.com/<user>/<event>
```

Set these in **Netlify → Site settings → Environment variables** and mirror them
in a local `.env` (copy [`.env.example`](../.env.example)). Netlify env changes
only take effect on **redeploy**.

The popup is themed to the brand sage green via
`pageSettings={{ primaryColor: "3D5A40" }}` — matches `--primary` in
`src/styles/theme.css`.

## Local development

```bash
cp .env.example .env      # then fill in VITE_CALENDLY_URL
npm run dev               # http://localhost:5173/contact
```

Vite reads `.env` **only at server start** — restart `npm run dev` after editing it.

On the Vite dev server (`localhost:5173`) two things are stubbed, both guarded by
an `isLocalDev` check, because the Netlify Forms endpoint doesn't exist there and
a real POST would 404/405:

- **The intake POST** ([`Contact.hook.ts`](../src/app/contact/Contact.hook.ts)) is
  faked as a success and logged.
- **The background booking POST** ([`CalendlyProvider.tsx`](../src/app/calendly/CalendlyProvider.tsx))
  is skipped and the payload logged.

Everything else runs for real — the scheduler opens, prefills, and the
`onClose(booked)` branch drives the success view, so the full UX is exercisable
locally. Keep it that way: don't short-circuit past `openCalendly()` under
`isLocalDev`, or the scheduler half stops being testable.

To exercise the Netlify Functions (the webhook), use `netlify dev` (port 8888)
instead of `npm run dev` — see [`calendly-sms-setup.md`](./calendly-sms-setup.md).

### Troubleshooting: the popup doesn't appear

1. **`VITE_CALENDLY_URL` is empty or unset.** This is the most common cause.
   `CalendlyProvider` gates `<PopupModal>` on a non-empty URL, so with it blank
   the modal is never rendered and `openCalendly()` silently does nothing. Check
   the value reaches the browser: `console.log(import.meta.env.VITE_CALENDLY_URL)`.
2. **The dev server wasn't restarted** after `.env` changed.
3. **The prefix is missing** — a var named `CALENDLY_URL` is invisible to the
   client bundle; Vite only exposes `VITE_`-prefixed vars.
4. **Something returns before `openCalendly()`** in `Contact.tsx`'s submit
   handler — verify the `result === "success"` branch actually reaches the call.

## Testing

- **Frontend:** set `VITE_CALENDLY_URL`, `npm run dev`, go to `/contact`, submit
  the form, confirm the prefilled scheduler opens. Book a slot and close it to
  check both success-view branches.
- **Backend** (signature verification + SMS formatting, no credentials needed):
  `npm test`.
