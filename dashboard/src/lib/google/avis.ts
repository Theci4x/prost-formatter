import "server-only";
import { BUSINESS_V4_BASE_URL } from "@/lib/google/business";

/**
 * Les avis de la fiche, lus et répondus par l'API Business Profile.
 *
 * Jusqu'ici, Klarr lisait les avis par l'API Places : cinq au plus, choisis
 * par Google, et sans moyen d'y répondre. L'API de la fiche les rend tous,
 * avec la réponse déjà publiée, et accepte la réponse de Klarr. Elle
 * demande en échange ce que Places ne demande pas : la connexion du
 * restaurateur à sa propre fiche, et l'accès que Google accorde sur
 * dossier.
 */

export type AvisGoogle = {
  /** « accounts/x/locations/y/reviews/z » : ce qui sert à y répondre. */
  name: string;
  auteur: string;
  note: number;
  texte: string;
  publieLe: string;
  reponse: { texte: string; le: string } | null;
};

export type AvisDeLaFiche = {
  avis: AvisGoogle[];
  note: number | null;
  total: number | null;
};

/**
 * Google refuse faute d'accès : quota à zéro tant que le dossier n'est pas
 * accepté. Ce n'est pas une panne, et l'écran ne doit pas le montrer comme
 * telle.
 */
export class AccesGoogleFerme extends Error {}

const ETOILES: Record<string, number> = {
  ONE: 1,
  TWO: 2,
  THREE: 3,
  FOUR: 4,
  FIVE: 5,
};

/** Google limite une réponse à 4 096 caractères. */
export const LONGUEUR_REPONSE_MAX = 4096;

async function appeler(url: string, init: RequestInit = {}): Promise<Response> {
  const res = await fetch(url, { ...init, cache: "no-store" });
  if (res.ok) return res;
  const corps = await res.text();
  if (
    res.status === 429 ||
    (res.status === 403 &&
      /quota|has not been used|SERVICE_DISABLED|RESOURCE_EXHAUSTED/i.test(
        corps,
      ))
  ) {
    throw new AccesGoogleFerme(`Google : accès fermé (${res.status})`);
  }
  throw new Error(`Google ${init.method ?? "GET"} ${res.status} : ${corps}`);
}

/** Les avis les plus récents de la fiche, réponse comprise. */
export async function listerAvisGoogle(
  accessToken: string,
  chemin: string,
): Promise<AvisDeLaFiche> {
  const url = new URL(`${BUSINESS_V4_BASE_URL}/${chemin}/reviews`);
  url.searchParams.set("pageSize", "50");
  url.searchParams.set("orderBy", "updateTime desc");

  const res = await appeler(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = (await res.json()) as {
    reviews?: {
      name: string;
      reviewer?: { displayName?: string; isAnonymous?: boolean };
      starRating?: string;
      comment?: string;
      createTime?: string;
      reviewReply?: { comment?: string; updateTime?: string };
    }[];
    averageRating?: number;
    totalReviewCount?: number;
  };

  return {
    avis: (data.reviews ?? []).map((r) => ({
      name: r.name,
      auteur: r.reviewer?.displayName?.trim() || "Client Google",
      note: ETOILES[r.starRating ?? ""] ?? 0,
      texte: r.comment ?? "",
      publieLe: r.createTime ?? "",
      reponse: r.reviewReply?.comment
        ? { texte: r.reviewReply.comment, le: r.reviewReply.updateTime ?? "" }
        : null,
    })),
    note: data.averageRating ?? null,
    total: data.totalReviewCount ?? null,
  };
}

/** Publie la réponse, ou remplace celle qui existe déjà. */
export async function repondreAvisGoogle(
  accessToken: string,
  avisName: string,
  texte: string,
): Promise<void> {
  await appeler(`${BUSINESS_V4_BASE_URL}/${avisName}/reply`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ comment: texte }),
  });
}

/** Retire la réponse de la fiche. */
export async function retirerReponseGoogle(
  accessToken: string,
  avisName: string,
): Promise<void> {
  await appeler(`${BUSINESS_V4_BASE_URL}/${avisName}/reply`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}
