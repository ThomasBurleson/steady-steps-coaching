import { createFileRoute } from "@tanstack/react-router";
import App from "@/app/App";

// "/" → the landing page.
export const Route = createFileRoute("/")({
  component: App,
});
