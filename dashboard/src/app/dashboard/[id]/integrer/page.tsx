import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, dashboardIcons } from "@/components/dashboard/PageHeader";
import { TitreSection } from "@/components/dashboard/Compteur";
import { BoutonCopier } from "@/components/dashboard/BoutonCopier";
import { exiger } from "@/lib/equipe/roles";
import { exigerModule } from "@/lib/abonnement/acces";
import { siteUrl } from "@/lib/site-url";

/**
 * La réservation Klarr, posée sur le site que le restaurant a déjà.
 *
 * Trois façons, de la plus complète à la plus simple : le bouton qui
 * ouvre la réservation par-dessus le site, le module affiché dans une
 * page, et le lien tout court. Le restaurateur choisit selon ce que son
 * outil de site accepte — pas selon ce qui nous arrange.
 */

const COULEURS = [
  { valeur: "#1f1b17", nom: "Encre" },
  { valeur: "#0f1e3d", nom: "Marine" },
  { valeur: "#e8871e", nom: "Orange" },
  { valeur: "#7a2e2e", nom: "Bordeaux" },
  { valeur: "#2f5d3a", nom: "Vert" },
];

const echapperAttribut = (texte: string) =>
  texte.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

function Code({ code, libelle }: { code: string; libelle: string }) {
  return (
    <div className="flex flex-col gap-2">
      <pre className="overflow-x-auto whitespace-pre-wrap break-all rounded-xl bg-zinc-900 px-4 py-3.5 font-mono text-[12.5px] leading-relaxed text-zinc-100">
        {code}
      </pre>
      <div>
        <BoutonCopier texte={code} libelle={libelle} copie="Code copié ✓" />
      </div>
    </div>
  );
}

export default async function IntegrerPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ texte?: string; couleur?: string; mode?: string }>;
}) {
  const { id } = await params;
  const options = await searchParams;
  await exiger(id, "gerant");
  await exigerModule(id, "reservations");

  const supabase = await createClient();
  const { data } = await supabase
    .from("restaurants")
    .select("nom, slug_reservation")
    .eq("id", id)
    .maybeSingle();
  const restaurant = data as {
    nom: string;
    slug_reservation: string | null;
  } | null;
  if (!restaurant) notFound();

  const slug = restaurant.slug_reservation;
  const site = siteUrl();
  const texte = (options.texte ?? "").trim().slice(0, 40);
  const couleur = COULEURS.some((c) => c.valeur === options.couleur)
    ? options.couleur!
    : COULEURS[0].valeur;
  const mode = options.mode === "bouton" ? "bouton" : "flottant";

  const attributs = [
    `src="${site}/widget.js"`,
    `data-restaurant="${slug ?? ""}"`,
    texte ? `data-texte="${echapperAttribut(texte)}"` : null,
    couleur !== COULEURS[0].valeur ? `data-couleur="${couleur}"` : null,
    mode === "bouton" ? `data-mode="bouton"` : null,
    "async",
  ].filter(Boolean);
  const codeScript = `<script ${attributs.join(" ")}></script>`;
  const codeIframe = `<iframe src="${site}/reserver/${slug ?? ""}?integre=1" title="Réserver chez ${echapperAttribut(restaurant.nom)}" style="width:100%;min-height:860px;border:0;border-radius:12px" loading="lazy"></iframe>`;
  const lien = `${site}/reserver/${slug ?? ""}`;

  // L'aperçu : une fausse page de site, avec le vrai script dedans.
  const apercu = `<!doctype html><html lang="fr"><body style="margin:0;font-family:Georgia,serif;background:#f6f1ea;color:#2b241d">
<div style="padding:28px 32px;border-bottom:1px solid #e4dccf;font-size:22px">${echapperAttribut(restaurant.nom)}</div>
<div style="padding:40px 32px;max-width:560px"><p style="font-size:30px;margin:0 0 12px">Votre site, tel qu'il est.</p>
<p style="font-family:system-ui,sans-serif;font-size:15px;line-height:1.6;color:#6b6258;margin:0 0 20px">Le bouton de réservation s'ajoute ${mode === "bouton" ? "à l'endroit où le code est collé" : "en bas à droite, sur toutes les pages"}. Cliquez dessus pour voir la fenêtre.</p>
${codeScript}</div></body></html>`;

  const lienOption = (changement: Record<string, string>) => {
    const p = new URLSearchParams({
      ...(texte ? { texte } : {}),
      couleur,
      mode,
      ...changement,
    });
    return `/dashboard/${id}/integrer?${p.toString()}`;
  };

  return (
    <div className="flex flex-1 flex-col gap-8 px-6 py-8">
      <div className="flex flex-col gap-3">
        <PageHeader
          icon={dashboardIcons.vitrine}
          title={`Réservation sur ton site — ${restaurant.nom}`}
        />
        <p className="max-w-4xl text-sm text-zinc-600">
          Tu as déjà un site ? Colle ce code dedans : tes clients réservent sans
          le quitter, et la réservation arrive dans ton carnet Klarr, sans
          commission. Si tu n&apos;as pas de site, ton{" "}
          <Link
            href={`/dashboard/${id}/vitrine`}
            className="font-semibold text-brand-navy underline"
          >
            site vitrine Klarr
          </Link>{" "}
          fait déjà tout ça.
        </p>
      </div>

      {!slug ? (
        <p className="max-w-4xl rounded-2xl border border-brand-orange/30 bg-brand-orange-soft px-5 py-4 text-sm text-ink">
          Ouvre d&apos;abord ta page de réservation : c&apos;est elle que le
          module affiche.{" "}
          <Link
            href={`/dashboard/${id}/reservations/configuration`}
            className="font-semibold underline"
          >
            Configurer mes réservations
          </Link>
        </p>
      ) : (
        <>
          <section className="grid items-start gap-6 rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-sm xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div className="flex min-w-0 flex-col gap-5">
              <TitreSection aside="recommandé">
                1. Un bouton « Réserver »
              </TitreSection>
              <p className="text-sm text-zinc-600">
                Le bouton ouvre la réservation par-dessus ton site. Sur
                téléphone, elle prend tout l&apos;écran.
              </p>

              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-ink">Où</span>
                <div className="flex flex-wrap gap-2">
                  {[
                    { cle: "flottant", libelle: "En bas à droite, partout" },
                    { cle: "bouton", libelle: "À l'endroit du code" },
                  ].map((m) => (
                    <Link
                      key={m.cle}
                      href={lienOption({ mode: m.cle })}
                      scroll={false}
                      className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                        mode === m.cle
                          ? "border-brand-navy bg-brand-navy text-white"
                          : "border-zinc-200 bg-white text-zinc-700 hover:border-brand-navy"
                      }`}
                    >
                      {m.libelle}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-ink">Couleur</span>
                <div className="flex flex-wrap gap-2">
                  {COULEURS.map((c) => (
                    <Link
                      key={c.valeur}
                      href={lienOption({ couleur: c.valeur })}
                      scroll={false}
                      aria-label={c.nom}
                      title={c.nom}
                      className={`h-9 w-9 rounded-full border-2 transition-transform hover:scale-105 ${
                        couleur === c.valeur
                          ? "border-brand-navy ring-2 ring-brand-navy/30"
                          : "border-white shadow"
                      }`}
                      style={{ background: c.valeur }}
                    />
                  ))}
                </div>
              </div>

              <form
                action={`/dashboard/${id}/integrer`}
                className="flex flex-wrap items-end gap-3"
              >
                <input type="hidden" name="couleur" value={couleur} />
                <input type="hidden" name="mode" value={mode} />
                <label className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <span className="text-sm font-medium text-ink">
                    Texte du bouton
                  </span>
                  <input
                    name="texte"
                    defaultValue={texte}
                    maxLength={40}
                    placeholder="Réserver une table"
                    className="rounded-lg border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-brand-navy focus:bg-white"
                  />
                </label>
                <button
                  type="submit"
                  className="rounded-lg border border-zinc-200 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:border-brand-navy hover:text-brand-navy"
                >
                  Appliquer
                </button>
              </form>

              <Code code={codeScript} libelle="Copier le code" />
              <p className="text-xs text-zinc-500">
                Le texte suit la langue de ton site si tu ne le changes pas : «
                Book a table » sur une page en anglais. Tes propres boutons
                peuvent aussi ouvrir la réservation : ajoute-leur
                l&apos;attribut <code>data-klarr-reserver</code>.
              </p>
            </div>

            <div className="flex min-w-0 flex-col gap-2">
              <span className="text-sm font-medium text-ink">Aperçu</span>
              <iframe
                title="Aperçu du bouton sur un site"
                srcDoc={apercu}
                className="h-[520px] w-full rounded-xl border border-zinc-200 bg-white"
              />
            </div>
          </section>

          <section className="flex flex-col gap-4 rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-sm">
            <TitreSection>2. La réservation dans une page</TitreSection>
            <p className="max-w-3xl text-sm text-zinc-600">
              Pour une page « Réserver » de ton site : le formulaire
              s&apos;affiche directement dedans, sans bouton. C&apos;est la
              solution pour Wix, dont le bloc HTML n&apos;accepte pas le bouton
              flottant.
            </p>
            <Code code={codeIframe} libelle="Copier le code" />
          </section>

          <section className="flex flex-col gap-4 rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-sm">
            <TitreSection>3. Un simple lien</TitreSection>
            <p className="max-w-3xl text-sm text-zinc-600">
              Si ton outil de site n&apos;accepte aucun code, mets ce lien sur
              n&apos;importe quel bouton « Réserver ».
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <code className="min-w-0 break-all rounded-lg bg-zinc-50 px-3 py-2 text-sm text-ink">
                {lien}
              </code>
              <BoutonCopier texte={lien} />
            </div>
          </section>

          <section className="flex max-w-4xl flex-col gap-3">
            <TitreSection>Où coller le code</TitreSection>
            <ul className="flex flex-col gap-2 text-sm text-zinc-600">
              <li>
                <strong className="text-ink">WordPress</strong> : un bloc « HTML
                personnalisé » dans la page. Pour le bouton sur tout le site,
                dans le pied de page du thème ou une extension d&apos;insertion
                de code.
              </li>
              <li>
                <strong className="text-ink">Wix</strong> : « Ajouter » puis «
                Intégrer du code » et « Intégrer du HTML », avec le code n°2. Le
                bouton sur tout le site passe par le code personnalisé des
                paramètres, réservé aux sites Premium.
              </li>
              <li>
                <strong className="text-ink">Squarespace</strong> : un bloc «
                Code » dans la page, ou l&apos;injection de code des paramètres
                avancés pour tout le site.
              </li>
              <li>
                <strong className="text-ink">Webflow</strong> : un élément «
                Embed », ou le code personnalisé du projet.
              </li>
              <li>
                <strong className="text-ink">
                  Un site fait par une agence
                </strong>{" "}
                : envoie-lui le code n°1, c&apos;est une ligne à ajouter.
              </li>
            </ul>
            <p className="text-xs text-zinc-500">
              Les noms des menus changent parfois d&apos;une version à
              l&apos;autre de ces outils.
            </p>
          </section>
        </>
      )}
    </div>
  );
}
