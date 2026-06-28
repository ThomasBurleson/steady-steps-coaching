import { createContext, useContext, useRef, useState, type ReactNode } from "react";
import { PopupModal, useCalendlyEventListener } from "react-calendly";

/**
 * Shared Calendly scheduling popup.
 *
 * The booking flow is form-first: the contact intake form (Contact.tsx) calls
 * `openCalendly()` on a successful submit, passing the visitor's name/email to
 * prefill the scheduler and an `onClose(booked)` callback. When a booking
 * completes we also fire a fire-and-forget Netlify `booking` form POST.
 *
 * Mounted above the router in `main.tsx` so the modal renders at the root (good
 * for an overlay) and is reachable from context.
 */

const CALENDLY_URL = import.meta.env.VITE_CALENDLY_URL ?? "";

// On the Vite dev server the Netlify form endpoint doesn't exist, so we skip the
// POST instead of hitting a 404/405 (mirrors Contact.hook.ts).
const isLocalDev =
  typeof window !== "undefined" &&
  window.location.hostname === "localhost" &&
  window.location.port === "5173";

const encode = (data: Record<string, string | undefined>) =>
  Object.keys(data)
    .map((k) => encodeURIComponent(k) + "=" + encodeURIComponent(data[k] ?? ""))
    .join("&");

export interface OpenCalendlyOptions {
  /** Prefilled into the Calendly scheduler so the visitor doesn't retype. */
  prefill?: { name?: string; email?: string };
  /** Called when the popup closes; `booked` is true only if a slot was scheduled. */
  onClose?: (booked: boolean) => void;
}

interface CalendlyContextValue {
  openCalendly: (opts?: OpenCalendlyOptions) => void;
}

const CalendlyContext = createContext<CalendlyContextValue | null>(null);

export function useCalendly(): CalendlyContextValue {
  const ctx = useContext(CalendlyContext);
  if (!ctx) throw new Error("useCalendly must be used within a CalendlyProvider");
  return ctx;
}

export function CalendlyProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [prefill, setPrefill] = useState<OpenCalendlyOptions["prefill"]>(undefined);
  // Whether a booking completed during the current popup session.
  const bookedThisSession = useRef(false);
  const onCloseRef = useRef<OpenCalendlyOptions["onClose"]>(undefined);

  useCalendlyEventListener({
    onEventScheduled: (e) => {
      bookedThisSession.current = true;
      const payload = e.data.payload;
      if (isLocalDev) {
        console.log("[dev] Calendly booking scheduled:", payload);
        return;
      }
      // Background lead capture — don't await so the popup stays responsive.
      fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: encode({
          "form-name": "booking",
          "event-uri": payload?.event?.uri ?? "",
          "invitee-uri": payload?.invitee?.uri ?? "",
          "scheduled-at": new Date().toISOString(),
        }),
      }).catch(() => {
        /* best-effort; the webhook is the source of truth for notifications */
      });
    },
  });

  const openCalendly = (opts?: OpenCalendlyOptions) => {
    bookedThisSession.current = false;
    onCloseRef.current = opts?.onClose;
    setPrefill(opts?.prefill);
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    const booked = bookedThisSession.current;
    bookedThisSession.current = false;
    const cb = onCloseRef.current;
    onCloseRef.current = undefined;
    cb?.(booked);
  };

  return (
    <CalendlyContext.Provider value={{ openCalendly }}>
      {children}
      {CALENDLY_URL && typeof document !== "undefined" && (
        <PopupModal
          url={CALENDLY_URL}
          open={isOpen}
          onModalClose={handleClose}
          rootElement={document.getElementById("root")!}
          prefill={prefill}
          pageSettings={{ primaryColor: "3D5A40" }}
        />
      )}
    </CalendlyContext.Provider>
  );
}
