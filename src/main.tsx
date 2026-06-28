import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import { RouterProvider } from "react-router";
import { router } from "./app/App.routing.ts";
import { CalendlyProvider } from "./app/calendly/CalendlyProvider.tsx";
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <CalendlyProvider>
      <RouterProvider router={router} />
    </CalendlyProvider>
  </HelmetProvider>,
);
