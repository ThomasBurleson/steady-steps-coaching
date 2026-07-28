/**
 * Force-mount signal for IntersectionObserver-gated home sections.
 *
 * Below-the-fold sections (About/Coaching/…) mount only when scrolled near, so a
 * nav/anchor link that jumps to a section by id would find nothing in the DOM.
 * `revealSection(id)` lets any link — even one inside a lazy sibling section —
 * tell the matching `DeferredSection` to mount immediately, without threading a
 * callback through the lazy boundary. See [[home/DeferredSection]] and
 * [[home/scroll]].
 */

const EVENT = "home:reveal-section";

/** Ask the gated section with this id to mount now (idempotent). */
export function revealSection(id: string) {
  window.dispatchEvent(new CustomEvent(EVENT, { detail: id }));
}

/** Subscribe to reveal requests; returns an unsubscribe function. */
export function onRevealSection(handler: (id: string) => void) {
  const listener = (e: Event) => handler((e as CustomEvent<string>).detail);
  window.addEventListener(EVENT, listener);
  return () => window.removeEventListener(EVENT, listener);
}
