/**
 * Home section anchor ids, in render order. Single source of truth shared by the
 * scroll-spy ([[home/useScrollSpy]]) and the reveal/scroll helpers
 * ([[home/scroll]]). Keep in sync with the `DeferredSection` `id`s in Landing.tsx.
 */
export const SECTION_IDS = [
  "about",
  "coaching",
  "approach",
  "testimonials",
  "insights",
] as const;

export type SectionId = (typeof SECTION_IDS)[number];
