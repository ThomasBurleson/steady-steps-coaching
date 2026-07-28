import { lazy, Suspense, useEffect, useRef, useState, type ComponentType } from "react";
import { onRevealSection } from "./reveal";

/**
 * Mounts a below-the-fold home section only when it nears the viewport
 * (IntersectionObserver), keeping its chunk off the initial load path. A
 * nav/anchor link can also force it to mount early via `revealSection(id)`
 * (see [[home/reveal]]). The reserved `minHeight` prevents layout shift and
 * gives the observer real scroll space to intersect.
 */
export default function DeferredSection({
  id,
  loader,
  minHeight,
  rootMargin = "200px 0px",
}: {
  /** Section id (matches the `<section id>` and reveal target). */
  id: string;
  loader: () => Promise<{ default: ComponentType }>;
  minHeight: number;
  rootMargin?: string;
}) {
  const [Comp] = useState(() => lazy(loader));
  const [shouldLoad, setShouldLoad] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (shouldLoad) return;

    // Progressive enhancement: without IO support, just mount it.
    if (typeof IntersectionObserver === "undefined") {
      setShouldLoad(true);
      return;
    }

    const el = ref.current;
    let io: IntersectionObserver | undefined;
    if (el) {
      io = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            setShouldLoad(true);
            io?.disconnect();
          }
        },
        { rootMargin },
      );
      io.observe(el);
    }

    // Force-mount when a nav/anchor link targets this section off-screen.
    const off = onRevealSection((revealedId) => {
      if (revealedId === id) setShouldLoad(true);
    });

    return () => {
      io?.disconnect();
      off();
    };
  }, [shouldLoad, id, rootMargin]);

  if (shouldLoad) {
    return (
      <Suspense fallback={<div aria-hidden="true" style={{ minHeight }} />}>
        <Comp />
      </Suspense>
    );
  }

  return <div ref={ref} aria-hidden="true" style={{ minHeight }} />;
}
