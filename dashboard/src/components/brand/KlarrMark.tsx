import { Instrument_Serif } from "next/font/google";

const instrumentSerif = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
});

// Marque "K" de Klarr — barre verticale bleu marine + deux diagonales
// (orange en haut, marine en bas) qui se rejoignent au centre, plus un
// petit éclat au bout de la diagonale orange. Recréée en vectoriel à
// partir du logo fourni (image non récupérable en fichier), même esprit
// : marine + orange, pas une reproduction pixel pour pixel.
export function KlarrMark({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="klarr-orange" x1="40" y1="52" x2="76" y2="16" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#E8871E" />
          <stop offset="1" stopColor="#F7B84B" />
        </linearGradient>
      </defs>
      <line x1="40" y1="52" x2="76" y2="88" stroke="#0F1E3D" strokeWidth="15" strokeLinecap="round" />
      <line x1="40" y1="52" x2="76" y2="16" stroke="url(#klarr-orange)" strokeWidth="15" strokeLinecap="round" />
      <rect x="22" y="14" width="16" height="72" rx="8" fill="#0F1E3D" />
      <g stroke="#F0A93C" strokeWidth="3.5" strokeLinecap="round">
        <line x1="76" y1="2" x2="76" y2="9" />
        <line x1="64" y1="7" x2="69" y2="11" />
        <line x1="88" y1="7" x2="83" y2="11" />
      </g>
    </svg>
  );
}

export function KlarrWordmark({ className }: { className?: string }) {
  return (
    <span
      className={`${instrumentSerif.className} ${className ?? ""}`}
      style={{ letterSpacing: "0.01em" }}
    >
      Klarr
    </span>
  );
}
