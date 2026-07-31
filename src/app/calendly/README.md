# Calendly integration

The shared scheduling popup. This folder is only the **frontend** half.

📖 **Full end-to-end flow, configuration, local-dev behavior, and
troubleshooting:** [`docs/contact-calendly.md`](../../../docs/contact-calendly.md)

📖 **Backend** (Calendly webhook → Netlify Function → Twilio SMS):
[`docs/calendly-sms-setup.md`](../../../docs/calendly-sms-setup.md) and
[`netlify/functions/calendly-webhook.ts`](../../../netlify/functions/calendly-webhook.ts)

---

## The provider API

[`CalendlyProvider.tsx`](./CalendlyProvider.tsx) renders one shared `PopupModal`
and exposes it through context:

```tsx
const { openCalendly } = useCalendly();

openCalendly({
  prefill: { name: "Jane Doe", email: "jane@example.com" },
  onClose: (booked) => { /* booked === true only if a slot was scheduled */ },
});
```

[`Contact.tsx`](../contact/Contact.tsx) is the only caller today, so the provider
wraps just `<Contact>` in [`routes/contact.tsx`](../../routes/contact.tsx) rather
than the whole app — this keeps `react-calendly` out of the homepage bundle (it
loads only with the `/contact` route chunk). The `PopupModal` still renders into
`#root` via its `rootElement`, so it overlays the full page regardless of where
the provider sits in the tree.

## Two things to know

- **`VITE_CALENDLY_URL` gates rendering.** If it's empty the `PopupModal` is
  never mounted and `openCalendly()` silently does nothing. This is the usual
  reason the popup "doesn't work" locally.
- **Booking is form-first.** No CTA opens Calendly directly — they navigate to
  `/contact`, and submitting the intake form is what calls `openCalendly()`.
