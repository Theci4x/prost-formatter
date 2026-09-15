"use client";

import { useEffect, useRef } from "react";

type Blob = {
  hue: string;
  radius: number;
  x: number;
  y: number;
  // Chaque tache dérive sur une ellipse propre, à sa propre vitesse : les
  // trajectoires ne se resynchronisent jamais, le mouvement ne "boucle" pas.
  ampX: number;
  ampY: number;
  speed: number;
  phase: number;
};

const BLOBS: Blob[] = [
  { hue: "232, 135, 30", radius: 0.42, x: 0.72, y: 0.28, ampX: 0.06, ampY: 0.05, speed: 0.00013, phase: 0 },
  { hue: "15, 30, 61", radius: 0.34, x: 0.28, y: 0.68, ampX: 0.05, ampY: 0.04, speed: 0.00009, phase: 2.1 },
  { hue: "240, 169, 60", radius: 0.3, x: 0.52, y: 0.12, ampX: 0.07, ampY: 0.03, speed: 0.00017, phase: 4.2 },
];

export function HeroBackdrop() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let frame = 0;
    let width = 0;
    let height = 0;

    function resize() {
      const parent = canvas!.parentElement;
      if (!parent) return;
      // Plafonné à 2 : au-delà on paie le coût mémoire sans gain visible sur
      // des dégradés aussi flous.
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = parent.clientWidth;
      height = parent.clientHeight;
      canvas!.width = width * ratio;
      canvas!.height = height * ratio;
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
      ctx!.setTransform(ratio, 0, 0, ratio, 0, 0);
    }

    function draw(time: number) {
      ctx!.clearRect(0, 0, width, height);
      const base = Math.max(width, height);

      for (const blob of BLOBS) {
        const t = reduceMotion ? 0 : time * blob.speed + blob.phase;
        const cx = (blob.x + Math.cos(t) * blob.ampX) * width;
        const cy = (blob.y + Math.sin(t * 1.3) * blob.ampY) * height;
        const r = blob.radius * base;

        const gradient = ctx!.createRadialGradient(cx, cy, 0, cx, cy, r);
        gradient.addColorStop(0, `rgba(${blob.hue}, 0.16)`);
        gradient.addColorStop(0.55, `rgba(${blob.hue}, 0.05)`);
        gradient.addColorStop(1, `rgba(${blob.hue}, 0)`);

        ctx!.fillStyle = gradient;
        ctx!.fillRect(0, 0, width, height);
      }

      if (!reduceMotion) frame = requestAnimationFrame(draw);
    }

    resize();
    frame = requestAnimationFrame(draw);

    const observer = new ResizeObserver(() => {
      resize();
      if (reduceMotion) draw(0);
    });
    if (canvas.parentElement) observer.observe(canvas.parentElement);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    />
  );
}
