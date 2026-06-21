import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight } from "lucide-react";
import { useContactForm } from "./Contact.hook";
import leafImg from "../../imports/leaf.png";

const inputClass =
  "w-full px-4 py-2.5 rounded-lg border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition text-sm";
const errorClass = "text-red-600 text-xs mt-1" as const;
const labelClass = "text-foreground text-sm font-semibold" as const;

const FILLED_STYLE = {
  background: "rgb(185 221 251)",
  color: "#000",
  fontSize: "0.95rem",
  fontWeight: 400,
};
const EMPTY_STYLE = {
  background: "#ffffff",
  color: "#1a1a1a",
  fontSize: "0.95rem",
  fontWeight: 400,
};
function fieldStyle(value: string | undefined) {
  return value ? FILLED_STYLE : EMPTY_STYLE;
}

function FieldError({ message }: { message?: string }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.p
          role="alert"
          className={errorClass}
          initial={{ opacity: 0, y: -4, height: 0 }}
          animate={{ opacity: 1, y: 0, height: "auto" }}
          exit={{ opacity: 0, y: -4, height: 0 }}
          transition={{ duration: 0.2 }}
        >
          {message}
        </motion.p>
      )}
    </AnimatePresence>
  );
}

export default function Contact() {
  const { form, onSubmit: submitForm } = useContactForm();
  const {
    register,
    watch,
    formState: { errors, isSubmitting },
  } = form;

  const [showSuccess, setShowSuccess] = useState(false);
  const [submitFailed, setSubmitFailed] = useState(false);

  const [firstName, lastName, email, phone, primaryAreas, biggestHurdle] = watch([
    "firstName",
    "lastName",
    "email",
    "phone",
    "primaryAreas",
    "biggestHurdle",
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitFailed(false);
    const result = await submitForm();
    if (result === "success") setShowSuccess(true);
    else if (result === "error") setSubmitFailed(true);
  };

  return (
    <section
      id="contact"
      aria-labelledby={showSuccess ? "contact-success-heading" : "contact-heading"}
      className="py-16 md:py-24"
      style={{ background: "var(--secondary)", scrollMarginTop: "60px" }}
    >
      <div className="max-w-[712px] mx-auto px-6">
        <AnimatePresence mode="wait">
          {showSuccess ? (
            /* ── Success view ── */
            <motion.div
              key="success"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="bg-card rounded-2xl p-10 md:p-16 shadow-md border border-border text-center overflow-hidden relative"
            >
              {/* Leaf repeating background */}
              <div
                aria-hidden="true"
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage: `url(${leafImg})`,
                  backgroundRepeat: "repeat",
                  backgroundSize: "110px",
                  opacity: 0.3,
                }}
              />

              {/* Radial glow */}
              <motion.div
                aria-hidden="true"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
              >
                <div
                  style={{
                    width: "340px",
                    height: "340px",
                    borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(61,90,64,0.1) 0%, transparent 70%)",
                  }}
                />
              </motion.div>

              {/* Animated checkmark */}
              <motion.div
                aria-hidden="true"
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 14, delay: 0.35 }}
                className="mx-auto mb-8 flex items-center justify-center rounded-full relative"
                style={{ width: "88px", height: "88px", background: "#7A93F2" }}
              >
                <svg viewBox="0 0 52 52" fill="none" style={{ width: "44px", height: "44px" }}>
                  <motion.path
                    d="M14 26 L22 34 L38 18"
                    stroke="#FDFAF6"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5, delay: 0.6, ease: "easeOut" }}
                  />
                </svg>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.65 }}
                className="relative mb-6"
                style={{
                  background: "rgba(255,255,255,0.50)",
                  padding: "20px",
                  borderRadius: "12px",
                  marginLeft: "-20px",
                  marginRight: "-20px",
                }}
              >
                <h2
                  id="contact-success-heading"
                  className="mb-3"
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "clamp(1.8rem, 3vw, 2.4rem)",
                    fontWeight: 700,
                    lineHeight: 1.2,
                    color: "var(--primary)",
                  }}
                >
                  Your request has been submitted!
                </h2>
                <p className="text-muted-foreground" style={{ lineHeight: 1.8, fontSize: "1rem" }}>
                  Thank you for reaching out. Chelsea will review your message and be in touch
                  within <strong>1–2 business days</strong> to schedule your free Clarity Session.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 1.0 }}
                className="border-t border-b border-border pt-6 pb-6 relative"
              >
                <p
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontStyle: "italic",
                    fontSize: "1rem",
                    lineHeight: 1.7,
                    color: "var(--muted-foreground)",
                  }}
                >
                  "Every journey begins with one steady step."
                </p>
              </motion.div>
            </motion.div>
          ) : (
            /* ── Request form ── */
            <motion.div
              key="form"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{ duration: 0.7 }}
                className="bg-card rounded-2xl p-8 md:p-12 shadow-md border border-border"
              >
                <h2
                  id="contact-heading"
                  className="text-foreground mb-3"
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "clamp(1.8rem, 3vw, 2.4rem)",
                    fontWeight: 700,
                    lineHeight: 1.2,
                  }}
                >
                  Let's Begin
                </h2>
                <p
                  className="text-muted-foreground mb-8"
                  style={{ lineHeight: 1.75, fontSize: "0.95rem" }}
                >
                  Let's connect with a <span className="underline">free</span>{" "}
                  <strong>15-minute</strong> introductory Clarity Session. Please take a few moments
                  to share what is on your mind so we can make the most of our free session.
                </p>

                <form
                  onSubmit={handleSubmit}
                  noValidate
                  aria-label="Clarity session request form"
                  className="flex flex-col gap-5"
                >
                  <input
                    type="hidden"
                    name="subject"
                    value="Session Request from steady-steps-coaching.netlify.app"
                  />

                  {/* Name row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label htmlFor="firstName" className={labelClass}>
                        First Name{" "}
                        <span aria-hidden="true" className="text-accent">
                          *
                        </span>
                      </label>
                      <input
                        id="firstName"
                        type="text"
                        autoComplete="given-name"
                        aria-required="true"
                        aria-describedby={errors.firstName ? "firstName-error" : undefined}
                        aria-invalid={!!errors.firstName}
                        className={`${inputClass} ${errors.firstName ? "border-red-500" : "border-border"}`}
                        style={fieldStyle(firstName)}
                        {...register("firstName")}
                      />
                      <FieldError message={errors.firstName?.message} />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label htmlFor="lastName" className={labelClass}>
                        Last Name{" "}
                        <span aria-hidden="true" className="text-accent">
                          *
                        </span>
                      </label>
                      <input
                        id="lastName"
                        type="text"
                        autoComplete="family-name"
                        aria-required="true"
                        aria-describedby={errors.lastName ? "lastName-error" : undefined}
                        aria-invalid={!!errors.lastName}
                        className={`${inputClass} ${errors.lastName ? "border-red-500" : "border-border"}`}
                        style={fieldStyle(lastName)}
                        {...register("lastName")}
                      />
                      <FieldError message={errors.lastName?.message} />
                    </div>
                  </div>

                  {/* Email + Phone row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label htmlFor="email" className={labelClass}>
                        Email Address{" "}
                        <span aria-hidden="true" className="text-accent">
                          *
                        </span>
                      </label>
                      <input
                        id="email"
                        type="email"
                        autoComplete="email"
                        aria-required="true"
                        aria-describedby={errors.email ? "email-error" : undefined}
                        aria-invalid={!!errors.email}
                        className={`${inputClass} ${errors.email ? "border-red-500" : "border-border"}`}
                        style={fieldStyle(email)}
                        {...register("email")}
                      />
                      <FieldError message={errors.email?.message} />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label htmlFor="phone" className={labelClass}>
                        Phone Number{" "}
                        <span aria-hidden="true" className="text-accent">
                          *
                        </span>
                      </label>
                      <input
                        id="phone"
                        type="tel"
                        autoComplete="tel"
                        aria-required="true"
                        aria-describedby={errors.phone ? "phone-error" : undefined}
                        aria-invalid={!!errors.phone}
                        className={`${inputClass} ${errors.phone ? "border-red-500" : "border-border"}`}
                        style={fieldStyle(phone)}
                        {...register("phone")}
                      />
                      <FieldError message={errors.phone?.message} />
                    </div>
                  </div>

                  <p className="text-foreground font-medium text-sm">
                    Tell me a little about yourself:
                  </p>

                  <div className="flex flex-col gap-1">
                    <label htmlFor="primaryAreas" className={labelClass}>
                      What are the primary areas of your life you are looking to shift right now?
                    </label>
                    <textarea
                      id="primaryAreas"
                      rows={4}
                      placeholder="Tell me a bit about your current challenge..."
                      className={`${inputClass} resize-none border-border`}
                      style={fieldStyle(primaryAreas)}
                      {...register("primaryAreas")}
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label htmlFor="biggestHurdle" className={labelClass}>
                      What do you feel is the biggest hurdle keeping you from taking your next
                      <span className="underline"> steady step</span>?
                    </label>
                    <textarea
                      id="biggestHurdle"
                      rows={4}
                      placeholder="Fear, timing, structure, lack of clarity..."
                      className={`${inputClass} resize-none border-border`}
                      style={fieldStyle(biggestHurdle)}
                      {...register("biggestHurdle")}
                    />
                  </div>

                  <AnimatePresence>
                    {submitFailed && (
                      <motion.p
                        role="alert"
                        className="text-white text-sm bg-red-800 border border-red-200 rounded-lg px-4 py-3"
                        initial={{ opacity: 0, y: -4, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: "auto" }}
                        exit={{ opacity: 0, y: -4, height: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        Something went wrong sending your request. Click the link to email us at{" "}
                        <a
                          href="mailto:lifer@SteadyStepsCoaching.online"
                          className="underline text-white-900"
                        >
                          lifer@SteadyStepsCoaching.online
                        </a>
                      </motion.p>
                    )}
                  </AnimatePresence>

                  {!submitFailed ? (
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      aria-disabled={isSubmitting}
                      className="w-full py-4 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                      style={{ fontWeight: 700, fontSize: "1rem" }}
                    >
                      {isSubmitting ? (
                        "Sending…"
                      ) : (
                        <>
                          Send your request <ArrowRight size={16} aria-hidden="true" />
                        </>
                      )}
                    </button>
                  ) : (
                    <></>
                  )}
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
