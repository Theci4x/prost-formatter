import "server-only";
import QRCode from "qrcode";
import { siteUrl } from "@/lib/site-url";

/** L'adresse publique de la carte : ce que le QR code encode. */
export function urlCarte(slug: string): string {
  return `${siteUrl()}/carte/${slug}`;
}

/**
 * Le QR code en SVG. Du vectoriel plutôt qu'une image : un chevalet de table
 * s'imprime, et un QR en pixels grossis ne se scanne plus.
 *
 * Correction d'erreur au niveau « M » : un QR de carte finit taché de sauce,
 * corné, photographié de biais. « M » encaisse environ 15 % de dégâts sans
 * grossir le motif au point de le rendre illisible de loin.
 */
export function qrSvg(slug: string): Promise<string> {
  return qrSvgDe(urlCarte(slug));
}

/**
 * Le même, pour n'importe quelle adresse.
 *
 * La carte n'est plus la seule chose qu'on pose sur une table : le jeu a
 * son propre panneau, avec son propre QR. Les réglages d'impression, eux,
 * ne changent pas — ils ont été choisis pour du papier taché de sauce.
 */
export function qrSvgDe(url: string): Promise<string> {
  return QRCode.toString(url, {
    type: "svg",
    errorCorrectionLevel: "M",
    margin: 2,
    color: { dark: "#0f1e3d", light: "#ffffff" },
  });
}

/** Le même, en PNG : ce qu'attendent les imprimeurs et Canva. */
export function qrPng(slug: string): Promise<Buffer> {
  return qrPngDe(urlCarte(slug));
}

/** Le même, pour n'importe quelle adresse. */
export function qrPngDe(url: string): Promise<Buffer> {
  return QRCode.toBuffer(url, {
    errorCorrectionLevel: "M",
    margin: 2,
    width: 1024,
    color: { dark: "#0f1e3d", light: "#ffffff" },
  });
}
