import type { MouseEvent } from "react";
import { revealSection } from "./reveal";
import { SECTION_IDS, type SectionId } from "./sections";

/**
 * True while a nav/anchor click is running a programmatic smooth scroll. The
 * scroll-spy ([[home/useScrollSpy]]) checks this and holds off writing the URL
 * hash until we arrive — writing it mid-scroll aborts the smooth animation and
 * the browser hard-jumps to the anchor instead.
 */
let programmaticScroll = false;
export const isProgrammaticScroll = () => programmaticScroll;

/**
 * Force-mount a gated section, then smooth-scroll to it once it renders and
 * reflect the section anchor in the URL (e.g. `/#about`). The section mounts
 * asynchronously after `revealSection`, so poll briefly for the element
 * (mirrors the hash-arrival retry in App.tsx).
 *
 * The hash is written only *after* the scroll settles (`scrollend`, with a
 * timeout fallback for browsers without it): writing it mid-scroll cancels the
 * smooth animation and the browser jumps to the anchor. We use `replaceState`
 * so the URL shows the anchor without re-jumping (as `location.hash =` would)
 * and without piling up a history entry per section.
 */
export function revealAndScrollTo(id: string) {
  // Reveal the target *and every gated section above it*: those siblings are
  // still reserved-height placeholders whose real content is a different
  // height, so mounting them mid-scroll would shift the target and we'd land
  // short. Reveal them now and don't measure/scroll until they've all rendered.
  const idx = SECTION_IDS.indexOf(id as SectionId);
  const required = idx >= 0 ? SECTION_IDS.slice(0, idx + 1) : [id];
  required.forEach(revealSection);

  let tries = 0;
  const attempt = () => {
    const el = document.getElementById(id);
    const ready = required.every((s) => document.getElementById(s));
    if (el && ready) {
      programmaticScroll = true;
      el.scrollIntoView({ behavior: "smooth", block: "start" });

      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        window.removeEventListener("scrollend", finish);
        clearTimeout(fallback);
        programmaticScroll = false;
        history.replaceState(null, "", `#${id}`);
      };
      window.addEventListener("scrollend", finish, { once: true });
      // Fallback: `scrollend` is unsupported, or the target was already in
      // place so no scroll (and no `scrollend`) ever fires.
      const fallback = setTimeout(finish, 1500);
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
