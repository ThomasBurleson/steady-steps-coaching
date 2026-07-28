import type { MouseEvent } from "react";

/**
 * Smooth-scroll to a same-page section by id. Used by the home page's "next
 * section" links in Hero/About/Coaching/Approach. Returns a click handler that
 * suppresses the default anchor jump. (The nav Header has its own variant that
 * also closes the mobile menu.)
 */
export const scrollToId = (id: string) => (e: MouseEvent) => {
  e.preventDefault();
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
};
