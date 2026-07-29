import { createFileRoute } from "@tanstack/react-router";
import App from "@/app/Landing";

// "/" → the landing page.
export const Route = createFileRoute("/")({
  component: App,
});
