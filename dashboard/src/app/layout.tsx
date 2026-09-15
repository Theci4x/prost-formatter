import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { siteUrl } from "@/lib/site-url";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
