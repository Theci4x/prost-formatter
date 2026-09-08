"use client";

import { useEffect, useRef, useState } from "react";

// "idle" = état servi par le serveur, visible : sans JavaScript, ou si
// l'animation est refusée, le contenu reste lisible. On ne masque que ce qui
// est déjà sous la ligne de flottaison, pour ne jamais faire clignoter du
// contenu déjà à l'écran.
type State = "idle" | "hidden" | "shown";

export function Reveal({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<State>("idle");

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (element.getBoundingClientRect().top < window.innerHeight) return;

    setState("hidden");

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setState("shown");
        observer.disconnect();
      },
      // La marge haute très large fait aussi compter comme "atteint" ce qui
      // est déjà passé au-dessus de la fenêtre : sans elle, un saut direct en
      // bas de page (barre de défilement, touche Fin, ancre) laisse les
      // sections survolées invisibles pour toujours.
      { rootMargin: "10000px 0px -12% 0px" },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const hidden = state === "hidden";

  return (
    <div
      ref={ref}
      style={{
        opacity: hidden ? 0 : 1,
        transform: hidden ? "translateY(22px)" : "translateY(0)",
        transition:
          state === "idle"
            ? undefined
            : `opacity 700ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms, transform 700ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}
