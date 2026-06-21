import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;

// On the Vite dev server the Netlify form endpoint doesn't exist, so we fake a
// successful submission instead of POSTing to a 404/405.
const isLocalDev =
  typeof window !== "undefined" &&
  window.location.hostname === "localhost" &&
  window.location.port === "5173";

// URL-encode a flat object for Netlify's form endpoint.
const encode = (data: Record<string, string | undefined>) =>
  Object.keys(data)
    .map((k) => encodeURIComponent(k) + "=" + encodeURIComponent(data[k] ?? ""))
    .join("&");

export const contactSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(phoneRegex, "Enter a valid phone number"),
  primaryAreas: z.string().optional(),
  biggestHurdle: z.string().optional(),
});

export type ContactFormValues = z.infer<typeof contactSchema>;

export type SubmitResult = "success" | "invalid" | "error";

export function useContactForm() {
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      primaryAreas: "",
      biggestHurdle: "",
    },
    mode: "onTouched",
  });

  // "success"  → validation passed and the POST succeeded
  // "invalid"  → validation failed (inline field errors are shown)
  // "error"    → validation passed but the network/server POST failed
  const onSubmit = async (): Promise<SubmitResult> => {
    let result: SubmitResult = "invalid";
    await form.handleSubmit(async (data) => {
      if (isLocalDev) {
        console.log("[dev] Faking successful Netlify submission:", data);
        result = "success";
        return;
      }
      try {
        const res = await fetch("/", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: encode({ "form-name": "contact", ...data }),
        });
        result = res.ok ? "success" : "error";
      } catch {
        result = "error";
      }
    })();
    return result;
  };

  return { form, onSubmit };
}
