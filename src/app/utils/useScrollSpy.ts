import { useEffect } from "react";
import { isProgrammaticScroll } from "./scroll";

/**
 * Live-updates the URL hash to reflect the home section currently in view as the
 * user scrolls (a "scroll spy"). Complements the click-driven hash update in
 * [[home/scroll]] `revealAndScrollTo` — there the change follows a nav click,
 * here it follows passive scrolling.
 *
 * Home sections mount lazily (see [[home/DeferredSection]]), so we can't observe
 * them all up front: a MutationObserver picks up each `section[id]` as it
 * appears and hands it to the IntersectionObserver. The "active" section is the
 * last one whose top has crossed the nav line (~80px). Above the first section
 * (Hero/top) the hash is cleared back to a clean `/`.
 *
 * We use `history.replaceState` (never `location.hash =`) so updating the URL
 * neither re-triggers a scroll nor piles up a history entry per section.
 */
export function useScrollSpy(ids: readonly string[]) {
  useEffect(() => {
    const targets = new Set(ids);
    const observed = new Set<Element>();
    let current = window.location.hash.replace("#", "");

    const NAV_OFFSET = 80; // matches the fixed banner + nav height

    const setHash = (id: string) => {
      if (id === current) return;
      current = id;
      const url = id ? `#${id}` : window.location.pathname + window.location.search;
      history.replaceState(null, "", url);
    };

    const io = new IntersectionObserver(
      () => {
        // A nav click drives its own smooth scroll and writes the hash on
        // arrival; writing it here mid-flight would abort that scroll.
        if (isProgrammaticScroll()) return;
        // The active section is the last one whose top has scrolled above the
        // nav line — i.e. the greatest `top` that is still ≤ the nav offset.
        let best: { id: string; top: number } | null = null;
        for (const el of observed) {
          if (!targets.has(el.id)) continue;
          const top = el.getBoundingClientRect().top;
          if (top <= NAV_OFFSET && (!best || top > best.top)) {
            best = { id: el.id, top };
          }
        }
        setHash(best ? best.id : "");
      },
      { threshold: [0, 1], rootMargin: `-${NAV_OFFSET}px 0px 0px 0px` },
    );

    const observeSections = () => {
      for (const id of targets) {
        const el = document.getElementById(id);
        if (el && !observed.has(el)) {
          observed.add(el);
          io.observe(el);
        }
      }
    };

    observeSections();
    const mo = new MutationObserver(observeSections);
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [ids]);
}
