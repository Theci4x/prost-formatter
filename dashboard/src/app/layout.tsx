import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Geist_Mono, Instrument_Serif, Manrope } from "next/font/google";
import "./globals.css";
import { siteUrl } from "@/lib/site-url";

// Les deux fontes de la maison, chargées une seule fois pour tout le site.
// Avant, la page d'accueil et le journal les chargeaient chacun de leur
// côté, et toutes les autres pages tombaient sur la police du système.
const manrope = Manrope({
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-instrument-serif",
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // Sans metadataBase, les adresses d'images d'aperçu restent relatives et
  // aucun réseau social ne sait les résoudre.
  metadataBase: new URL(siteUrl()),
  title: {
    default: "Klarr — la clarté pour votre restaurant",
    // Chaque page complète son propre titre ; « Klarr — Dashboard » partout
    // était faux dès que la page n'était pas le tableau de bord.
    template: "%s · Klarr",
  },
  description:
    "Votre fiche Google, vos avis, votre visibilité dans les réponses des IA et vos réservations, au même endroit. Sans commission par couvert.",
  applicationName: "Klarr",
  openGraph: {
    type: "website",
    siteName: "Klarr",
    locale: "fr_FR",
    title: "Klarr — la clarté pour votre restaurant",
    description:
      "Ce que voient vraiment vos clients : votre fiche Google, vos avis, votre visibilité dans les IA. Et vos réservations, sans commission.",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${manrope.variable} ${instrumentSerif.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
