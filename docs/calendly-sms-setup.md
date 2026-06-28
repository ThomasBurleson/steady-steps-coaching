# Calendly booking → real-time SMS setup

When someone books via the Calendly popup, Calendly fires an `invitee.created`
webhook to a Netlify Function ([netlify/functions/calendly-webhook.ts](../netlify/functions/calendly-webhook.ts)),
which texts the coach via Twilio.

**Prerequisites:** a **paid Calendly plan** (webhooks aren't on the free tier)
and a **Twilio** account with a sending number.

## Environment variables

Set these in **Netlify → Site settings → Environment variables** (and mirror in
a local `.env` — see [.env.example](../.env.example)):

| Var | What |
| --- | --- |
| `VITE_CALENDLY_URL` | Your Calendly event link (frontend popup) |
| `CALENDLY_WEBHOOK_SIGNING_KEY` | Printed by the setup script below |
| `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` | Twilio credentials |
| `TWILIO_FROM_NUMBER` | Your Twilio number, E.164 (e.g. `+15555550123`) |
| `COACH_PHONE_NUMBER` | Where the alert SMS is sent, E.164 |
| `COACH_TIMEZONE` | Optional IANA tz for the time in the SMS (defaults to the invitee's) |

## Setup order (do once)

Env-var changes only take effect on a **redeploy**, and the webhook needs the
**live** function URL — so the order matters:

1. **Deploy** the site to Netlify and note the function URL:
   `https://<your-site>.netlify.app/.netlify/functions/calendly-webhook`
2. Set `VITE_CALENDLY_URL` and the four `TWILIO_*` / `COACH_PHONE_NUMBER` vars.
3. **Create the webhook subscription** (generates the signing key):
   ```bash
   CALENDLY_PAT=<your-personal-access-token> \
   WEBHOOK_URL=https://<your-site>.netlify.app/.netlify/functions/calendly-webhook \
   npm run webhook:setup
   ```
   Get a PAT at: Calendly → Integrations & apps → API & webhooks → Personal
   access tokens. Use `-- --scope organization` if you want bookings from all
   team members (default is `user` = just you).
4. Copy the printed key into `CALENDLY_WEBHOOK_SIGNING_KEY` in Netlify.
5. **Redeploy** so the function picks up the signing key + Twilio vars.
6. Book a test slot → you should get an SMS within seconds.

To include the customer's **phone number** in the SMS, make sure the Calendly
event type collects a phone (a custom question or the SMS-reminder field) —
otherwise the SMS has name, email, time, and any question answers.

## Local testing

The signature verification and message formatting are unit-tested without any
credentials:

```bash
npm test
```

Full end-to-end local testing requires the Netlify CLI (`netlify dev`) plus a
public tunnel for Calendly to reach; testing on a deploy preview is simpler.
