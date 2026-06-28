# Calendly integration

How customers schedule a coaching session from this app, and how the coach is
notified in real time.

There are two halves:

- **Frontend (this folder)** — a Calendly scheduling popup, free embed, no
  backend. Documented below.
- **Backend** — a Calendly webhook → Netlify Function → Twilio SMS. See
  [`netlify/functions/calendly-webhook.ts`](../../../netlify/functions/calendly-webhook.ts)
  and the setup guide at [`docs/calendly-sms-setup.md`](../../../docs/calendly-sms-setup.md).

---

## Frontend: the booking popup

### Flow: form first, then schedule

"Book a Call" does **not** open Calendly directly. It reveals the intake form,
and submitting that form is what opens the scheduler — prefilled with the
visitor's name and email. This captures the coaching intake answers (primary
areas, biggest hurdle) *and* lets the visitor book in one motion.

```
"Book a Call" (any CTA)
      │  scroll / navigate to #contact
      ▼
Intake form (Contact.tsx) ── submit ──▶ POST to Netlify "contact" form
      │
      │ on success: openCalendly({ prefill: {name, email}, onClose })
      ▼
Calendly PopupModal (prefilled)
      ├─ visitor schedules (onEventScheduled)
      │     └─ background POST → Netlify "booking" form (lead record)
      ▼
popup closes (onClose(booked))
      ▼
Contact success view
      ├─ booked      → "Your session is booked!"
      └─ not booked  → "Your request has been submitted!" (intake already sent)
```

Because the intake form is POSTed *before* the scheduler opens, closing the
popup without booking is still a captured lead — hence the "we'll be in touch"
success copy in that case.

### Pieces

| File | Role |
| --- | --- |
| [`CalendlyProvider.tsx`](./CalendlyProvider.tsx) | Renders one shared `PopupModal` at the root; exposes `openCalendly({ prefill, onClose })` via context. |
| [`../../main.tsx`](../../main.tsx) | Wraps `<RouterProvider>` in `<CalendlyProvider>` so the modal renders above the route tree. |
| [`../components/Contact.tsx`](../components/Contact.tsx) | Owns the flow: on form-submit success, opens the prefilled scheduler and shows the success view when it closes. |
| [`../App.tsx`](../App.tsx) | The "Book a Call" CTAs scroll to the intake form (`#contact`). |
| [`../blog/Header.tsx`](../blog/Header.tsx) | The blog "Book a Call" links to `/#contact` (the form on the home page). |
| [`../../../index.html`](../../../index.html) | Hidden Netlify `booking` form so the background lead POST is recognized at build time. |

### The provider API

```tsx
const { openCalendly } = useCalendly();

openCalendly({
  prefill: { name: "Jane Doe", email: "jane@example.com" },
  onClose: (booked) => { /* booked === true only if a slot was scheduled */ },
});
```

`Contact.tsx` is the only caller today. The popup is mounted once at the root
(good for an overlay) rather than per-button, which is why it lives in a
provider above the router.

### Configuration

The scheduling URL comes from an env var (Vite requires the `VITE_` prefix):

```
VITE_CALENDLY_URL=https://calendly.com/<user>/<event>
```

If it's unset the popup doesn't render, so the form submit would fall straight
through to the success view. The popup is themed to the brand sage green via
`pageSettings={{ primaryColor: "3D5A40" }}` (matches `--primary` in
`src/styles/theme.css`).

### Data available on the free embed

`onEventScheduled` only exposes the **event and invitee URIs** — not the
visitor's details. That's fine here because the intake form already captured
name/email/phone/answers. The coach's real-time SMS with full details is
delivered by the **webhook → Twilio** backend (paid Calendly plan); see the
backend docs linked above.

---

## Testing

- Frontend: set `VITE_CALENDLY_URL`, `npm run dev`, click a CTA, submit the form,
  and confirm the prefilled scheduler opens. On the dev server the background
  POST is skipped (logged instead).
- Backend signature/format logic: `npm test`.
