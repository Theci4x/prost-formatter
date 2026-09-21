"use client";

import { useState } from "react";
import type { ClesService } from "@/lib/i18n/service";
import { BoutonAction } from "@/components/reservations/BoutonAction";
import {
  annulerReservation,
  constaterAbsence,
} from "@/app/dashboard/[id]/reservations/actions";

/**
 * Une table sur l'écran de salle, qui s'ouvre sur ce qu'il faut pour la
 * traiter.
 *
 * En plein service, ce qu'on cherche n'est pas un bouton de plus : c'est
 * le téléphone du client qui n'est pas arrivé. Toucher le nom ouvre donc
 * le détail — appeler, écrire, ce qu'il a demandé — et c'est seulement là
 * que se trouvent l'annulation et le constat d'absence, à l'abri d'un
 * pouce qui glisse pendant le coup de feu.
 *
 * Le nom seul est le bouton, pas la ligne entière : le placement à table
 * vit à droite, et un bouton dans un bouton n'existe pas.
 */

export type DetailLigne = {
  id: string;
  clientNom: string;
  telephone: string | null;
  email: string | null;
  couverts: number;
  heure: string | null;
  occasion: string | null;
  message: string | null;
  noteInterne: string | null;
  type: "table" | "privatisation";
  statut: string;
  absenceConstatee: boolean;
  /** Le jour de la table, pour savoir si l'absence peut déjà se constater. */
  date: string;
};

function Chevron({ ouvert }: { ouvert: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`shrink-0 transition-transform ${ouvert ? "rotate-90" : ""}`}
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function Contact({
  href,
  libelle,
  valeur,
}: {
  href: string;
  libelle: string;
  valeur: string;
}) {
  return (
    <a
      href={href}
      className="flex min-w-0 flex-1 basis-40 flex-col gap-0.5 rounded-xl border border-line bg-paper px-4 py-3 transition-colors hover:border-ink"
    >
      <span className="text-xs font-semibold uppercase tracking-[0.06em] text-ink-soft">
        {libelle}
      </span>
      <span className="truncate text-[15px] font-medium text-ink">
        {valeur}
      </span>
    </a>
  );
}

export function LigneService({
  restaurantId,
  detail,
  jour,
  children,
  sv,
}: {
  restaurantId: string;
  detail: DetailLigne;
  /** Le jour affiché, pour comparer sans refaire le calcul ici. */
  jour: string;
  /** Le placement à table, rendu par le serveur. */
  children: React.ReactNode;
  sv: ClesService;
}) {
  const [ouvert, setOuvert] = useState(false);

  // Le serveur revérifie de toute façon ; ici on évite seulement de
  // proposer un bouton qui refusera.
  const absenceConstatable =
    detail.statut === "confirmee" && detail.date <= jour;

  return (
    <li className="flex flex-col gap-3 py-2.5 first:pt-0 last:pb-0">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <button
          type="button"
          onClick={() => setOuvert((avant) => !avant)}
          aria-expanded={ouvert}
          className="flex min-w-0 items-baseline gap-2 text-left"
        >
          <Chevron ouvert={ouvert} />
          <span className="flex min-w-0 flex-col">
            <span className="font-medium text-ink">
              {detail.clientNom}
              {detail.type === "privatisation" && (
                <span className="ml-2 rounded-full bg-brand-orange-soft px-2 py-0.5 text-xs font-medium text-brand-navy">
                  {sv.privatise}
                </span>
              )}
              {detail.absenceConstatee && (
                <span className="ml-2 rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-ink-soft">
                  {sv.absent}
                </span>
              )}
            </span>
            {(detail.occasion || detail.noteInterne) && (
              <span className="text-sm text-ink-soft">
                {[detail.occasion, detail.noteInterne]
                  .filter(Boolean)
                  .join(" · ")}
              </span>
            )}
          </span>
        </button>

        <span className="flex flex-wrap items-baseline justify-end gap-x-4 gap-y-1 text-sm">
          {children}
          {detail.telephone && (
            <a
              href={`tel:${detail.telephone}`}
              className="text-ink-soft hover:text-ink"
            >
              {detail.telephone}
            </a>
          )}
          {/* L'unité est répétée : à côté d'un numéro de téléphone, un
              nombre nu se lit mal. */}
          <span className="font-medium tabular-nums text-ink">
            {detail.couverts}{" "}
            <span className="font-normal text-ink-soft">couv.</span>
          </span>
        </span>
      </div>

      {ouvert && (
        <div className="flex flex-col gap-4 rounded-2xl border border-line bg-brand-cream p-4">
          {/* Joindre le client passe avant tout le reste : c'est pour ça
              qu'on ouvre cette fiche un vendredi à 20 h 40. */}
          {(detail.telephone || detail.email) && (
            <div className="flex flex-wrap gap-2">
              {detail.telephone && (
                <Contact
                  href={`tel:${detail.telephone}`}
                  libelle={sv.appeler}
                  valeur={detail.telephone}
                />
              )}
              {detail.telephone && (
                <Contact
                  href={`sms:${detail.telephone}`}
                  libelle="SMS"
                  valeur={detail.telephone}
                />
              )}
              {detail.email && (
                <Contact
                  href={`mailto:${detail.email}`}
                  libelle={sv.email}
                  valeur={detail.email}
                />
              )}
            </div>
          )}

          {!detail.telephone && !detail.email && (
            <p className="text-sm text-ink-soft">{sv.niTelephoneNiAdresse}</p>
          )}

          <dl className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
            {detail.heure && (
              <div className="flex flex-col">
                <dt className="text-xs uppercase tracking-[0.06em] text-ink-soft">
                  {sv.arrivee}
                </dt>
                <dd className="font-medium text-ink">
                  {detail.heure.slice(0, 5).replace(":", "h")}
                </dd>
              </div>
            )}
            <div className="flex flex-col">
              <dt className="text-xs uppercase tracking-[0.06em] text-ink-soft">
                {sv.couvertsLabel}
              </dt>
              <dd className="font-medium text-ink">{detail.couverts}</dd>
            </div>
            {detail.occasion && (
              <div className="flex flex-col">
                <dt className="text-xs uppercase tracking-[0.06em] text-ink-soft">
                  {sv.occasion}
                </dt>
                <dd className="font-medium text-ink">{detail.occasion}</dd>
              </div>
            )}
          </dl>

          {detail.message && (
            <div className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-[0.06em] text-ink-soft">
                {sv.ceQueLeClientAEcrit}
              </span>
              <p className="whitespace-pre-line text-sm leading-relaxed text-ink">
                {detail.message}
              </p>
            </div>
          )}

          {detail.noteInterne && (
            <div className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-[0.06em] text-ink-soft">
                {sv.votreNote}
              </span>
              <p className="whitespace-pre-line text-sm leading-relaxed text-ink">
                {detail.noteInterne}
              </p>
            </div>
          )}

          {/* Les deux gestes qui engagent, en bas et discrets : on ne les
              trouve qu'en ayant ouvert la fiche. */}
          <div className="flex flex-wrap items-start gap-4 border-t border-line pt-3">
            {detail.absenceConstatee ? (
              <BoutonAction
                action={constaterAbsence}
                champs={{
                  reservation_id: detail.id,
                  restaurant_id: restaurantId,
                  retirer: "1",
                }}
                libelle={sv.retirerConstatAbsence}
                enCours={sv.enCoursRetrait}
                className="text-sm font-medium text-ink-soft hover:text-ink"
              />
            ) : (
              absenceConstatable && (
                <BoutonAction
                  action={constaterAbsence}
                  champs={{
                    reservation_id: detail.id,
                    restaurant_id: restaurantId,
                  }}
                  libelle={sv.noterAbsent}
                  enCours={sv.enCoursEnregistrement}
                  className="text-sm font-medium text-ink-soft hover:text-ink"
                />
              )
            )}

            {detail.statut !== "annulee" && (
              <BoutonAction
                action={annulerReservation}
                champs={{
                  reservation_id: detail.id,
                  restaurant_id: restaurantId,
                }}
                libelle={sv.annulerCetteTable}
                enCours={sv.enCoursAnnulation}
                className="text-sm font-medium text-red-600 hover:text-red-800"
              />
            )}
          </div>
        </div>
      )}
    </li>
  );
}
