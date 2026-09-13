import { KlarrMark, KlarrWordmark } from "./KlarrMark";

// Icônes trait fines (étoile, épingle de carte, fourchette/couteau) qui
// flottent doucement autour de la marque, pour donner un peu de vie au
// panneau sans tomber dans le cliché "clipart restaurant".
function FloatingIcon({
  children,
  style,
}: {
  children: React.ReactNode;
  style: React.CSSProperties;
}) {
  return (
    <div style={{ position: "absolute", opacity: 0.5, ...style }}>
      {children}
    </div>
  );
}

export function LoginIllustration() {
  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        background: "#0F1E3D",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flex: 1,
        width: "100%",
      }}
    >
      <div
        style={{
          position: "absolute",
          width: 340,
          height: 340,
          borderRadius: "50%",
          background: "#E8871E",
          filter: "blur(90px)",
          opacity: 0.35,
          top: -80,
          right: -100,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 260,
          height: 260,
          borderRadius: "50%",
          background: "#F7B84B",
          filter: "blur(80px)",
          opacity: 0.2,
          bottom: -60,
          left: -60,
        }}
      />

      <FloatingIcon style={{ top: "18%", left: "20%", transform: "rotate(-12deg)" }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#F7B84B" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15 9 22 9.5 16.5 14.5 18 22 12 18 6 22 7.5 14.5 2 9.5 9 9" />
        </svg>
      </FloatingIcon>
      <FloatingIcon style={{ bottom: "22%", left: "16%", transform: "rotate(8deg)" }}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#FAF7F0" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z" />
          <circle cx="12" cy="10" r="2.5" />
        </svg>
      </FloatingIcon>
      <FloatingIcon style={{ top: "22%", right: "16%", transform: "rotate(10deg)" }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F7B84B" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 3v6a2 2 0 0 0 2 2v10" />
          <path d="M7 3v6" />
          <path d="M4 3v6" />
          <path d="M17 3c-1.5 1-2 3-2 5s.5 3 2 4v10" />
        </svg>
      </FloatingIcon>

      <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 18, textAlign: "center", padding: 32 }}>
        <KlarrMark size={56} variant="light" />
        <div>
          <KlarrWordmark className="text-4xl text-white" />
        </div>
        <p style={{ maxWidth: 260, color: "#C7CEDB", fontSize: 14, lineHeight: 1.6 }}>
          La clarté pour vos restaurants — votre présence en ligne, réunie
          dans un seul tableau de bord.
        </p>
      </div>
    </div>
  );
}
