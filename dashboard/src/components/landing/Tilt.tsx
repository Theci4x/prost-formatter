"use client";

import { useRef, useState } from "react";

// Inclinaison au repos : la carte a déjà l'air en volume avant tout
// mouvement de souris (et sur mobile, où il n'y en aura jamais).
const REST = "perspective(1400px) rotateY(-7deg) rotateX(3deg)";

export function Tilt({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState(REST);

  function handleMove(event: React.MouseEvent<HTMLDivElement>) {
    const element = ref.current;
    if (!element) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const rect = element.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    setTransform(
      `perspective(1400px) rotateY(${-7 + x * 14}deg) rotateX(${3 - y * 10}deg)`,
    );
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={() => setTransform(REST)}
      style={{
        transform,
        transformStyle: "preserve-3d",
        transition: "transform 260ms cubic-bezier(0.22, 1, 0.36, 1)",
        willChange: "transform",
      }}
    >
      {children}
    </div>
  );
}

// Pastille qui flotte en avant de la carte : c'est le translateZ qui crée la
// profondeur, elle bouge donc avec l'inclinaison du parent.
export function FloatingChip({
  children,
  depth = 60,
  style,
}: {
  children: React.ReactNode;
  depth?: number;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        position: "absolute",
        transform: `translateZ(${depth}px)`,
        display: "flex",
        alignItems: "center",
        gap: 8,
        background: "var(--paper)",
        border: "1px solid var(--line)",
        borderRadius: 100,
        padding: "9px 15px",
        fontSize: 13,
        fontWeight: 600,
        whiteSpace: "nowrap",
        boxShadow: "0 18px 40px -18px oklch(20% 0.02 60 / 40%)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
