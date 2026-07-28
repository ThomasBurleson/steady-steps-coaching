import type { MouseEvent } from "react";
import { revealSection } from "./reveal";

/**
 * Force-mount a gated section, then smooth-scroll to it once it renders. The
 * section mounts asynchronously after `revealSection`, so poll briefly for the
 * element (mirrors the hash-arrival retry in App.tsx).
 */
export function revealAndScrollTo(id: string) {
  revealSection(id);
  let tries = 0;
  const attempt = () => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    } else if (tries++ < 40) {
      setTimeout(attempt, 50); // ~2s budget for the chunk to load + render
    }
  };
  attempt();
}

/**
 * onClick handler for same-page anchor links (Hero/About/Coaching/Approach
 * "next section" links, Footer). Suppresses the default anchor jump and reveals
 * + scrolls to the target gated section.
 */
export const scrollToSection = (id: string) => (e: MouseEvent) => {
  e.preventDefault();
  revealAndScrollTo(id);
};
