import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/service";
import { SignatureKlarr } from "@/components/brand/SignatureKlarr";
import { langueVisiteur } from "@/lib/i18n/langue";
import { AVIS } from "@/lib/i18n/avis";
import { siteUrl } from "@/lib/site-url";
import { PARTIES_PAR_JOUR } from "@/lib/roue/tirage";

/**
 * Le règlement du jeu.
 *
 * Une loterie publicitaire est licite en France, y compris avec obligation
 * d'achat depuis la loi du 17 mars 2014, mais son règlement doit être
 * accessible et l'offre ne doit pas être trompeuse. La roue distribuait
 * des lots sans qu'aucun document ne l'encadre : ceci le répare.
 *
 * **Le document est écrit à partir des réglages réels de l'établissement.**
 * La durée de validité, le délai de rejeu et la liste des lots sont lus en
 * base, jamais recopiés à la main. Un règlement qui annoncerait trente
 * jours quand le code en applique quatre-vingt-dix serait pire que pas de
 * règlement du tout — c'est exactement ce qu'on appelle une pratique
 * commerciale trompeuse.
 *
 * **Il reste en français**, comme les CGU et le devis : c'est la pièce
 * qu'on opposera, elle vise un jeu organisé en France par un
 * établissement français. Une ligne le dit au lecteur étranger dans sa
 * langue, pour qu'il n'y voie pas une traduction oubliée.
 *
 * **L'organisateur est le restaurateur, pas Klarr.** C'est lui qui offre
 * le lot et lui qui doit l'honorer ; EDIREF fournit l'outil. Ce partage
 * n'était écrit nulle part, et un client à qui on refuse son lot se
 * retournait donc vers nous.
 */

type Params = { slug: string };

type Maison = {
  nom: string;
  adresse: string | null;
  email_contact: string | null;
};

type Reglages = {
  active: boolean;
  validite_jours: number;
  delai_rejeu_jours: number;
};

type Lot = { libelle: string; gagnant: boolean };

async function charger(slug: string) {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("restaurants")
    .select("id, nom, adresse, email_contact")
    .eq("slug_reservation", slug)
    .maybeSingle();
  const maison = data as (Maison & { id: string }) | null;
  if (!maison) return null;

  const [{ data: roueData }, { data: lotsData }] = await Promise.all([
    supabase
      .from("restaurant_roue")
      .select("active, validite_jours, delai_rejeu_jours")
      .eq("restaurant_id", maison.id)
      .maybeSingle(),
    supabase
      .from("restaurant_roue_lots")
      .select("libelle, gagnant")
      .eq("restaurant_id", maison.id)
      .order("ordre")
      .order("created_at"),
  ]);

  const reglages = roueData as Reglages | null;
  // Pas de roue configurée : il n'y a pas de jeu, donc pas de règlement.
  if (!reglages) return null;

  return { maison, reglages, lots: (lotsData ?? []) as Lot[] };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const a = AVIS[await langueVisiteur()];
  const charge = await charger(slug);
  return {
    title: charge
      ? `${a.reglementDuJeu} — ${charge.maison.nom}`
      : a.reglementDuJeu,
    // Le règlement d'un jeu de table n'a rien à faire dans un moteur de
    // recherche : il s'adresse à qui joue, et on y arrive par la roue.
    robots: { index: false, follow: false },
  };
}

function Article({
  n,
  titre,
  children,
}: {
  n: string;
  titre: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-base font-semibold text-ink">
        <span className="mr-2 text-brand-orange">{n}</span>
        {titre}
      </h2>
      <div className="flex flex-col gap-2 text-sm leading-relaxed text-zinc-600">
        {children}
      </div>
    </section>
  );
}

export default async function ReglementPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const langue = await langueVisiteur();
  const a = AVIS[langue];
  const charge = await charger(slug);
  if (!charge) notFound();

  const { maison, reglages, lots } = charge;
  const gagnants = lots.filter((lot) => lot.gagnant);
  const perdants = lots.length - gagnants.length;
  const contact = maison.email_contact;

  return (
    <div className="flex min-h-screen flex-col bg-brand-cream">
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-7 px-6 py-10">
        <div className="flex flex-col gap-2">
          <h1 className="font-serif text-3xl text-ink">Règlement du jeu</h1>
          <p className="text-sm text-zinc-500">
            {maison.nom}
            {maison.adresse ? ` — ${maison.adresse}` : ""}
          </p>
          {a.reglementEnFrancais && (
            <p className="text-sm text-zinc-500">{a.reglementEnFrancais}</p>
          )}
        </div>

        <Article n="1" titre="Organisateur">
          <p>
            Le jeu est organisé par <strong>{maison.nom}</strong>
            {maison.adresse ? `, ${maison.adresse}` : ""} (ci-après
            «&nbsp;l&apos;établissement&nbsp;»), qui en définit les lots et
            les conditions, et à qui il appartient de les honorer.
          </p>
          <p>
            L&apos;établissement utilise pour cela l&apos;outil Klarr, édité
            par EDIREF. EDIREF fournit le moyen technique et n&apos;est ni
            organisateur ni garant du jeu&nbsp;: toute question relative à un
            lot se règle avec l&apos;établissement.
          </p>
        </Article>

        <Article n="2" titre="Objet et durée">
          <p>
            Le jeu permet à un participant de tenter sa chance en actionnant
            une roue affichée sur la page{" "}
            <Link
              href={`/jeu/${slug}`}
              className="text-brand-navy underline underline-offset-2"
            >
              {siteUrl()}/jeu/{slug}
            </Link>
            .
          </p>
          <p>
            Il est ouvert tant que l&apos;établissement le maintient actif.
            Celui-ci peut le suspendre ou y mettre fin à tout moment, sans
            préavis&nbsp;; les lots déjà attribués et non expirés restent dus.
          </p>
        </Article>

        <Article n="3" titre="Participation">
          <p>
            La participation est <strong>gratuite et sans obligation
            d&apos;achat</strong>. Elle est ouverte à toute personne physique
            majeure, à l&apos;exclusion du personnel de l&apos;établissement.
          </p>
          <p>
            Participer suppose de communiquer une adresse électronique valide
            et d&apos;accepter de recevoir le lot à cette adresse. Une adresse
            inexacte prive le participant de son lot sans recours.
          </p>
          <p>Deux limites s&apos;appliquent&nbsp;:</p>
          <ul className="ml-5 flex list-disc flex-col gap-1">
            <li>
              {PARTIES_PAR_JOUR} participations au maximum par appareil et par
              jour&nbsp;;
            </li>
            <li>
              {reglages.delai_rejeu_jours > 0 ? (
                <>
                  une seule participation par adresse électronique tous les{" "}
                  <strong>{reglages.delai_rejeu_jours} jours</strong>.
                </>
              ) : (
                <>aucune limite de renouvellement par adresse électronique.</>
              )}
            </li>
          </ul>
        </Article>

        <Article n="4" titre="Détermination du résultat">
          <p>
            Le résultat est déterminé <strong>par tirage au sort</strong>,
            effectué sur le serveur au moment où le participant actionne la
            roue. L&apos;animation affichée se règle sur ce résultat&nbsp;:
            elle ne le produit pas.
          </p>
          <p>
            Les cases n&apos;ont pas toutes la même probabilité&nbsp;:
            l&apos;établissement affecte à chacune un poids relatif. Le tirage
            respecte en outre les stocks qu&apos;il a fixés&nbsp;; une case
            dont le stock est épuisé n&apos;est plus tirée.
          </p>
          <p>
            <strong>
              Le résultat ne dépend d&apos;aucune note, d&apos;aucun avis et
              d&apos;aucune action du participant sur une plateforme tierce.
            </strong>{" "}
            Il est identique que le participant laisse un avis ou non, et quel
            que soit le contenu de cet avis. L&apos;établissement n&apos;a
            connaissance ni de l&apos;un ni de l&apos;autre.
          </p>
        </Article>

        <Article n="5" titre="Dotation">
          {lots.length > 0 ? (
            <>
              <p>
                La roue comporte {lots.length} case
                {lots.length > 1 ? "s" : ""}, dont {gagnants.length} gagnante
                {gagnants.length > 1 ? "s" : ""}
                {perdants > 0 ? ` et ${perdants} perdante${perdants > 1 ? "s" : ""}` : ""}
                &nbsp;:
              </p>
              <ul className="ml-5 flex list-disc flex-col gap-1">
                {lots.map((lot, rang) => (
                  <li key={`${lot.libelle}-${rang}`}>
                    {lot.libelle}
                    {lot.gagnant ? "" : " — case perdante"}
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p>Aucune case n&apos;est configurée à ce jour.</p>
          )}
          <p>
            Les lots sont personnels et ne peuvent être ni échangés, ni cédés,
            ni remboursés, ni convertis en espèces.
          </p>
        </Article>

        <Article n="6" titre="Remise du lot">
          <p>
            Le participant gagnant reçoit un code, affiché à l&apos;écran
            immédiatement après le tirage et envoyé à son adresse
            électronique.
          </p>
          <p>
            Ce code est valable{" "}
            <strong>{reglages.validite_jours} jours</strong> à compter du
            tirage. Il se présente sur place, à l&apos;établissement, lors
            d&apos;une visite&nbsp;; il n&apos;est utilisable{" "}
            <strong>qu&apos;une seule fois</strong> et cesse de l&apos;être
            après sa date d&apos;expiration.
          </p>
          <p>
            L&apos;absence de réception du courrier électronique — notamment
            s&apos;il est classé en indésirable — ne prolonge pas ce délai. Le
            code affiché à l&apos;écran fait foi.
          </p>
        </Article>

        <Article n="7" titre="Données personnelles">
          <p>
            <strong>{maison.nom}</strong> est responsable du traitement des
            données collectées à l&apos;occasion du jeu. EDIREF agit pour son
            compte, en qualité de sous-traitant.
          </p>
          <p>
            Sont collectés&nbsp;: l&apos;adresse électronique du participant,
            la date de sa participation, le lot obtenu et son code, ainsi
            qu&apos;une empreinte technique non nominative servant uniquement
            à faire respecter les limites de l&apos;article 3.
          </p>
          <p>
            Ces données servent à remettre le lot et, lorsque le participant
            y a consenti, à lui adresser les actualités de
            l&apos;établissement. Ce consentement se retire à tout moment,
            par le lien de désinscription figurant dans chaque message, sans
            que cela remette en cause le lot obtenu.
          </p>
          <p>
            Le participant dispose des droits d&apos;accès, de rectification,
            d&apos;effacement, de limitation, d&apos;opposition et de
            portabilité, qu&apos;il exerce auprès de l&apos;établissement
            {contact ? (
              <>
                {" "}
                à l&apos;adresse{" "}
                <a
                  href={`mailto:${contact}`}
                  className="text-brand-navy underline underline-offset-2"
                >
                  {contact}
                </a>
              </>
            ) : null}
            . Il peut introduire une réclamation auprès de la CNIL.
          </p>
        </Article>

        <Article n="8" titre="Responsabilité">
          <p>
            L&apos;établissement est seul tenu de la remise des lots.
            L&apos;organisateur ne saurait être tenu responsable d&apos;un
            dysfonctionnement du réseau, de l&apos;appareil du participant ou
            d&apos;une interruption du service indépendante de sa volonté.
          </p>
        </Article>

        <Article n="9" titre="Acceptation et droit applicable">
          <p>
            Actionner la roue vaut acceptation pleine et entière du présent
            règlement. Celui-ci est soumis au droit français. Toute
            réclamation s&apos;adresse d&apos;abord à l&apos;établissement
            {contact ? `, à l'adresse ${contact}` : ""}.
          </p>
        </Article>

        <Link
          href={`/jeu/${slug}`}
          className="w-fit text-sm text-zinc-500 underline-offset-2 hover:text-ink hover:underline"
        >
          ← Retour au jeu
        </Link>
      </main>

      <footer className="border-t border-zinc-200/70 px-6 py-6">
        <SignatureKlarr texte={a.signatureJeu} className="mx-auto max-w-2xl" />
      </footer>
    </div>
  );
}
