import type { AuditResult } from "@/app/test-presence-google/actions";
import type { translations } from "@/lib/i18n/testPresence";
import { formater, type Impact, type Pilier } from "@/lib/audit/actions";
import { lienWhatsApp, numeroWhatsApp } from "@/lib/contact/whatsapp";
import { BoutonImprimer } from "@/components/devis/BoutonImprimer";
import { POIDS_PILIERS } from "@/lib/audit/scoring";

const LABEL_COLORS: Record<AuditResult["label"], string> = {
  excellent: "bg-emerald-50 text-emerald-700 border-emerald-200",
  bon: "bg-amber-50 text-amber-700 border-amber-200",
  moyen: "bg-orange-50 text-orange-700 border-orange-200",
  critique: "bg-red-50 text-red-700 border-red-200",
};

const COULEURS_IMPACT: Record<Impact, string> = {
  fort: "bg-red-50 text-red-700 border-red-200",
  moyen: "bg-amber-50 text-amber-700 border-amber-200",
  faible: "bg-brand-sand text-ink-soft border-line",
};

function ScoreBar({
  label,
  score,
  poids,
  poidsLabel,
}: {
  label: string;
  score: number;
  /** La part de ce pilier dans la note finale, en pourcentage. */
  poids: number;
  poidsLabel: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-baseline gap-2">
          <span className="font-medium text-ink">{label}</span>
          {/* Un score qu'on ne sait pas expliquer ne se défend pas : on
              montre ce que chaque pilier pèse dans la note. */}
          <span className="rounded-full border border-line px-1.5 py-px text-[10px] uppercase tracking-wider text-ink-soft">
            {poidsLabel} {Math.round(poids * 100)} %
          </span>
        </span>
        <span className="text-ink-soft">{score}/100</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-brand-sand">
        <div
          className="h-full rounded-full bg-brand-orange"
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

export function AuditResultCard({
  audit,
  t,
  email,
  entreprise,
}: {
  audit: AuditResult;
  t: (typeof translations)[keyof typeof translations]["audit"];
  /** Déjà saisie deux écrans plus tôt : on la transporte, on ne la redemande pas. */
  email?: string;
  /** Le nom tapé au formulaire, quand la fiche Google n'a rien rendu. */
  entreprise?: string;
}) {
  // Le lien part de son téléphone vers nous, jamais l'inverse : c'est ce
  // qui le rend gratuit, illimité et autorisé sans gabarit ni compte
  // WhatsApp Business (voir `lib/contact/whatsapp.ts`). Sans numéro
  // configuré, pas de bouton — plutôt qu'un lien mort.
  const numero = numeroWhatsApp();
  const maison = audit.fiche?.nom ?? entreprise ?? "";
  const lien =
    numero && maison
      ? lienWhatsApp(
          numero,
          t.whatsapp.message
            .replace("[[nom]]", maison)
            .replace("[[note]]", String(audit.score)),
        )
      : null;

  return (
    <div className="audit-rapport flex flex-col gap-6 rounded-xl border border-line bg-white p-6 shadow-sm print:gap-5 print:rounded-none print:border-0 print:p-0 print:shadow-none">
      {/* Le prospect doit reconnaître son établissement avant de lire un
          seul chiffre : sa note, ses avis, son adresse. Sans ça, le
          rapport a l'air d'un document type, et tout ce qui suit perd sa
          crédibilité. */}
      {audit.fiche && (
        <div className="flex flex-col gap-1.5 border-b border-line pb-5">
          <h3 className="font-serif text-2xl leading-tight text-ink">
            {audit.fiche.nom}
          </h3>
          {audit.fiche.genre && (
            <span className="text-sm text-ink-soft">{audit.fiche.genre}</span>
          )}
          {audit.fiche.note !== null && (
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-semibold text-ink">
                ★ {audit.fiche.note.toLocaleString("fr-FR")}
              </span>
              {audit.fiche.avis !== null && (
                <span className="text-sm text-ink-soft">
                  ({audit.fiche.avis.toLocaleString("fr-FR")} {t.avis})
                </span>
              )}
            </div>
          )}
          <span className="text-sm leading-relaxed text-ink-soft">
            {audit.fiche.adresse}
          </span>
          <div className="flex flex-wrap gap-x-4 text-sm text-ink-soft">
            {audit.fiche.telephone && <span>{audit.fiche.telephone}</span>}
            {audit.fiche.siteWeb && (
              <a
                href={audit.fiche.siteWeb}
                target="_blank"
                rel="noreferrer"
                className="text-brand-orange hover:underline"
              >
                {new URL(audit.fiche.siteWeb).hostname}
              </a>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-ink">{t.title}</h3>
        <span
          className={`rounded-full border px-3 py-1 text-xs font-semibold ${LABEL_COLORS[audit.label]}`}
        >
          {t.labels[audit.label]}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-5xl font-bold text-ink">{audit.score}</span>
        <span className="text-sm text-ink-soft">{t.globalLabel} /100</span>
      </div>

      <div className="flex flex-col gap-4">
        <ScoreBar
          label={t.localSeo}
          score={audit.pillars.localSeo}
          poids={POIDS_PILIERS.localSeo}
          poidsLabel={t.poids}
        />
        <ScoreBar
          label={t.eReputation}
          score={audit.pillars.eReputation}
          poids={POIDS_PILIERS.eReputation}
          poidsLabel={t.poids}
        />
        <ScoreBar
          label={t.geo}
          score={audit.pillars.geo}
          poids={POIDS_PILIERS.geo}
          poidsLabel={t.poids}
        />
      </div>

      {/* Un score sans quoi faire ensuite n'est qu'un reproche. Chaque
          ligne porte le chiffre qui la déclenche : « 8 photos » se discute,
          « votre visibilité est perfectible » ne se discute pas. */}
      <div className="flex flex-col gap-3 border-t border-stone-100 pt-5">
        <h4 className="text-sm font-semibold text-ink">{t.actionsTitre}</h4>

        {audit.actions.length === 0 ? (
          <p className="text-sm text-ink-soft">{t.actionsVide}</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {audit.actions.map((action) => {
              const texte = t.actions[action.cle];
              return (
                <li
                  key={action.cle}
                  className="flex flex-col gap-1.5 rounded-lg border border-line p-4"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-ink">
                      {texte.titre}
                    </span>
                    {/* De quoi relève cette action. Cinq lignes se
                        parcourent du regard quand elles sont étiquetées,
                        se lisent une à une quand elles ne le sont pas. */}
                    <span className="rounded-full border border-line bg-brand-sand px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-ink-soft">
                      {t.piliers[action.pilier as Pilier]}
                    </span>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${COULEURS_IMPACT[action.impact]}`}
                    >
                      {t.impacts[action.impact]}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-ink-soft">
                    {formater(texte.constat, action.valeurs)}
                  </p>
                  {texte.klarr && (
                    <p className="text-sm leading-relaxed text-amber-800">
                      <span className="font-medium">{t.avecKlarr}</span> —{" "}
                      {texte.klarr}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* La seule mesure de cet audit qui interroge vraiment un assistant.
          Elle vient après les actions parce qu'elle ne se corrige pas d'un
          geste — mais c'est elle qu'on retient, parce qu'elle nomme des
          maisons que le restaurateur connaît. */}
      {audit.presenceIa && (
        <div className="flex flex-col gap-3 rounded-xl border border-brand-navy/20 bg-brand-navy px-5 py-5 text-white">
          <span className="text-xs font-bold uppercase tracking-[0.08em] text-brand-orange">
            {t.ia.titre}
          </span>

          <div className="flex flex-col gap-1">
            <span className="text-[11px] uppercase tracking-wider text-white/50">
              {t.ia.question}
            </span>
            <p className="font-serif text-lg leading-snug">
              « {audit.presenceIa.question} »
            </p>
          </div>

          <p
            className={`text-sm font-medium ${
              audit.presenceIa.cite ? "text-emerald-300" : "text-orange-300"
            }`}
          >
            {audit.presenceIa.cite
              ? audit.presenceIa.rang
                ? formater(t.ia.citeRang, {
                    rang: String(audit.presenceIa.rang),
                  })
                : t.ia.cite
              : t.ia.pasCite}
          </p>

          {audit.presenceIa.concurrents.length > 0 ? (
            <div className="flex flex-col gap-2">
              <span className="text-[11px] uppercase tracking-wider text-white/50">
                {t.ia.concurrents}
              </span>
              <ol className="flex flex-col gap-1">
                {audit.presenceIa.concurrents.map((nom, rang) => (
                  <li key={nom} className="flex items-baseline gap-2 text-sm">
                    <span className="font-mono text-xs text-white/40">
                      #{rang + 1}
                    </span>
                    <span>{nom}</span>
                  </li>
                ))}
              </ol>
            </div>
          ) : (
            <p className="text-sm text-white/60">{t.ia.aucun}</p>
          )}
        </div>
      )}

      {/* Ce qu'aucun outil ne mesure, et qu'on dit honnêtement ne pas
          noter. Ces quatre lignes ne servent pas le diagnostic : elles
          donnent une raison de se parler, et c'est pour ça qu'on les
          assume comme telles plutôt que de feindre de les scorer. */}
      <div className="flex flex-col gap-2 rounded-xl border border-dashed border-line px-5 py-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-semibold text-ink">{t.oral.titre}</span>
          <span className="text-xs text-ink-soft">{t.oral.sousTitre}</span>
        </div>
        <ul className="flex flex-col gap-1.5">
          {t.oral.points.map((point) => (
            <li
              key={point}
              className="flex gap-2 text-sm leading-relaxed text-ink-soft"
            >
              <span className="text-brand-orange">—</span>
              {point}
            </li>
          ))}
        </ul>
      </div>

      {/* Le moment où il est piqué au vif est le seul où il agira. Lui
          promettre un rappel sous 48 heures, c'est le laisser refroidir :
          l'essai doit pouvoir commencer ici, tout de suite, et le rappel
          devient un complément au lieu d'être la seule suite. */}
      <div className="flex flex-col gap-3 rounded-xl border border-brand-orange/30 bg-brand-orange-soft px-5 py-5 print:hidden">
        <span className="font-serif text-xl text-ink">{t.essai.titre}</span>
        <p className="text-sm leading-relaxed text-ink-soft">{t.essai.corps}</p>
        <a
          href={`/login${email ? `?email=${encodeURIComponent(email)}` : ""}`}
          className="w-fit rounded-md bg-brand-navy px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-navy-hover"
        >
          {t.essai.bouton}
        </a>
      </div>

      {/* Après le bouton d'essai, et pas avant : celui qui est prêt à
          commencer seul n'a pas à passer par nous. Celui qui a une
          question, lui, n'avait jusqu'ici qu'un rappel à attendre. */}
      <div className="flex flex-wrap gap-3 print:hidden">
        {lien && (
          <a
            href={lien}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-fit items-center gap-2 rounded-md border border-line px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:border-brand-orange"
          >
            <LogoWhatsApp />
            {t.whatsapp.libelle}
          </a>
        )}
        {/* Le même bouton que sur le devis, et pour la même raison : le
            document existe déjà en HTML, le dialogue du navigateur sait
            l'enregistrer en PDF, et il en sort exactement ce qui est à
            l'écran. Un rapport qu'on peut transmettre à son associé vaut
            mieux qu'un rapport qu'il faut savoir retrouver. */}
        <BoutonImprimer
          libelle={t.imprimer}
          className="flex w-fit items-center gap-2 rounded-md border border-line px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:border-ink"
        />
      </div>

      <p className="text-sm text-ink-soft print:hidden">{t.recontacted}</p>

      {/* Seulement sur le papier : une feuille qui circule sans rien qui
          dise d'où elle vient ne ramène personne. */}
      <p className="hidden text-xs text-ink-soft print:block">
        klarr.net — {t.title}
      </p>
    </div>
  );
}

/** Le combiné dans sa bulle, tel que WhatsApp le dessine. */
function LogoWhatsApp() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      style={{ flex: "none", color: "#25D366" }}
    >
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.14-.14.3-.35.45-.53.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.53-.08-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.38-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.7.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2-1.41.25-.7.25-1.29.18-1.42-.07-.13-.27-.2-.57-.35z" />
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.96L2 22l5.25-1.38a9.87 9.87 0 0 0 4.78 1.22h.01c5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2zm0 18.15h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.11.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.24-8.23a8.19 8.19 0 0 1 8.23 8.24c0 4.54-3.7 8.23-8.24 8.23z" />
    </svg>
  );
}
