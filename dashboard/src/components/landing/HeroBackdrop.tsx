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
  {
    hue: "232, 135, 30",
    radius: 0.42,
    x: 0.72,
    y: 0.28,
    ampX: 0.06,
    ampY: 0.05,
    speed: 0.00013,
    phase: 0,
  },
  {
    hue: "15, 30, 61",
    radius: 0.34,
    x: 0.28,
    y: 0.68,
    ampX: 0.05,
    ampY: 0.04,
    speed: 0.00009,
    phase: 2.1,
  },
  {
    hue: "240, 169, 60",
    radius: 0.3,
    x: 0.52,
    y: 0.12,
    ampX: 0.07,
    ampY: 0.03,
    speed: 0.00017,
    phase: 4.2,
  },
];

export function HeroBackdrop() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Sur téléphone, le fond reste immobile. Redessiner tout le hero à
    // chaque image occupait le fil principal pendant le chargement — des
    // secondes de calcul sur un mobile modeste, que PageSpeed comptait
    // contre l'affichage du texte. Immobile, il ne coûte qu'un dessin.
    const immobile =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      window.matchMedia("(max-width: 640px)").matches;

    // Trente images par seconde suffisent à une dérive aussi lente ; la
    // moitié du travail d'un rafraîchissement complet.
    const INTERVALLE = 1000 / 30;

    let frame = 0;
    let derniere = 0;
    let width = 0;
    let height = 0;
    let visible = true;
    let lance = false;

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

    function peindre(time: number) {
      ctx!.clearRect(0, 0, width, height);
      const base = Math.max(width, height);

      for (const blob of BLOBS) {
        const t = immobile ? blob.phase : time * blob.speed + blob.phase;
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
    }

    function boucle(time: number) {
      frame = 0;
      if (!visible || document.hidden) return;
      if (time - derniere >= INTERVALLE) {
        derniere = time;
        peindre(time);
      }
      frame = requestAnimationFrame(boucle);
    }

    function relancer() {
      if (immobile || !lance || frame || !visible || document.hidden) return;
      frame = requestAnimationFrame(boucle);
    }

    resize();
    peindre(0);

    // L'animation attend que la page soit chargée et que le navigateur
    // souffle : le texte du hero passe avant le décor.
    let attenteIdle = 0;
    let attenteMinuteur: ReturnType<typeof setTimeout> | undefined;
    const demarrer = () => {
      lance = true;
      relancer();
    };
    const apresChargement = () => {
      if (typeof window.requestIdleCallback === "function") {
        attenteIdle = window.requestIdleCallback(demarrer, { timeout: 2000 });
      } else {
        attenteMinuteur = setTimeout(demarrer, 500);
      }
    };
    if (!immobile) {
      if (document.readyState === "complete") apresChargement();
      else window.addEventListener("load", apresChargement, { once: true });
    }

    // Hors de l'écran ou onglet caché, rien ne se dessine.
    const vue = new IntersectionObserver(([entree]) => {
      visible = entree?.isIntersecting ?? true;
      relancer();
    });
    vue.observe(canvas);
    const surVisibilite = () => relancer();
    document.addEventListener("visibilitychange", surVisibilite);

    const observer = new ResizeObserver(() => {
      resize();
      peindre(derniere);
    });
    if (canvas.parentElement) observer.observe(canvas.parentElement);

    return () => {
      cancelAnimationFrame(frame);
      if (typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(attenteIdle);
      }
      clearTimeout(attenteMinuteur);
      window.removeEventListener("load", apresChargement);
      document.removeEventListener("visibilitychange", surVisibilite);
      vue.disconnect();
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
