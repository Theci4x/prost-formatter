import type { Billet } from "@/types/blog";

export const billet: Billet = {
  slug: "ouvrir-un-restaurant-demarches",
  titre: "Ouvrir un restaurant en France : tout ce qu'on découvre trop tard",
  resume:
    "La liste des démarches obligatoires, dans l'ordre où elles se présentent — et les quatre qu'on oublie systématiquement, parce que personne ne les annonce.",
  categorie: "ouvrir",
  publieLe: "2026-09-14",
  misAJourLe: "2026-09-14",
  sources: [
    {
      intitule:
        "Décret n° 2017-899 du 9 mai 2017 (repérage amiante avant travaux)",
      url: "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000034637576",
    },
    {
      intitule: "Décret n° 2017-1244 du 7 août 2017 (bruits et sons amplifiés)",
      url: "https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000035388481",
    },
    {
      intitule: "Cerfa n° 13984 — déclaration d'activité auprès de la DDPP",
      url: "https://www.formulaires.service-public.gouv.fr/gf/cerfa_13984.do",
    },
    {
      intitule:
        "Urssaf — attestation de vigilance et obligation du donneur d'ordre",
      url: "https://www.urssaf.fr/accueil/attestation-vigilance.html",
    },
  ],
  essentiel: [
    "Le diagnostic immobilier remis à la signature ne vaut pas diagnostic avant travaux : le repérage amiante est une obligation distincte, et elle est à votre charge.",
    "Au-delà de 5 000 € de contrat, les ouvriers de votre artisan deviennent votre problème : attestation de vigilance Urssaf à réclamer, vérifier et redemander tous les six mois.",
    "L'étude d'impact sonore ne vise pas que les boîtes de nuit, et elle doit précéder les travaux d'insonorisation.",
    "La déclaration sanitaire est une démarche à part : immatriculer sa société ne déclare pas son activité alimentaire.",
  ],
  image: {
    fichier: "/blog/ouvrir-paperasse.jpg",
    alt: "Un restaurateur assis seul dans sa salle fermée, la tête dans la main, devant des piles de courriers Urssaf, TVA, impôts et normes de sécurité.",
  },
  suite: [
    {
      slug: "permis-exploitation-licence-restaurant",
      pourquoi:
        "Le premier piège de la liste, et le plus cher à découvrir tard.",
    },
    {
      slug: "avis-google-restaurant-ce-qui-est-interdit",
      pourquoi:
        "Votre fiche Google existera avant votre ouverture, remplie sans vous. Autant savoir ce qu'on a le droit d'en faire.",
    },
    {
      slug: "diagnostics-avant-travaux-restaurant",
      pourquoi:
        "Avant de toucher aux murs, ce qu'il faut avoir fait constater.",
    },
  ],
  markdown: `
Cet article est né d'une ouverture ratée sur quatre points. Pas ratée au sens où le restaurant n'a pas ouvert — il a ouvert — mais ratée au sens où quatre obligations ont été découvertes après coup, chacune ayant coûté du temps, de l'argent, ou les deux.

Ce ne sont pas des règles obscures. Ce sont des règles que **personne ne vous annonce** : ni le bailleur, ni le comptable, ni l'architecte, chacun supposant que c'est l'affaire d'un autre.

::: attention Le point qui tue le plus de projets
L'extraction. Sans conduit jusqu'en toiture, pas de cuisine chaude — et ça ne se répare pas après coup. Ça se vérifie **avant de signer le bail**, pas après, parce qu'aucun budget travaux ne rattrape un immeuble qui ne peut pas être percé.
:::

## Les quatre qu'on découvre trop tard

**1. Le diagnostic immobilier ne vaut pas diagnostic avant travaux.** Le repérage amiante avant travaux est une obligation distincte, à votre charge en tant que maître d'ouvrage, sur tout bâtiment dont le permis est antérieur à juillet 1997. On s'en aperçoit quand le chantier a commencé — c'est-à-dire trop tard.
→ [Les diagnostics à faire avant de toucher aux murs](/blog/diagnostics-avant-travaux-restaurant)

**2. Les ouvriers de votre artisan sont aussi votre problème.** Au-delà de 5 000 € de contrat, vous devez réclamer l'attestation de vigilance Urssaf, la vérifier, et la redemander tous les six mois. Sans ça, vous êtes solidairement redevable des cotisations impayées de votre prestataire.
→ [Des ouvriers travaillent chez vous : ce que vous risquez](/blog/ouvriers-sur-votre-chantier-obligations)

**3. L'étude d'impact des nuisances sonores ne concerne pas que les boîtes de nuit.** Elle vise les lieux qui diffusent des sons amplifiés à titre habituel et à niveau élevé — un DJ le vendredi, une vraie sonorisation, pas la musique d'ambiance du service. Et elle doit précéder les travaux d'insonorisation, sinon elle vous fait refaire ce que vous venez de payer.
→ [Étude d'impact sonore : qui est vraiment concerné](/blog/etude-impact-nuisances-sonores-restaurant)

**4. La déclaration sanitaire est une démarche à part.** Immatriculer sa société ne déclare pas son activité alimentaire. Tout établissement qui manipule des denrées d'origine animale doit se déclarer à la DDPP de son département via le Cerfa n° 13984, **avant l'ouverture** — comptez un mois d'avance.
→ [Immatriculer sa société ne déclare pas son restaurant](/blog/declaration-sanitaire-restaurant-ddpp)

## La liste, dans l'ordre

### Avant de signer le bail

- Vérifier que la **destination des locaux** autorise la restauration : un local commercial n'est pas automatiquement un restaurant, et le changement de destination s'instruit en mairie.
- Vérifier la **faisabilité de l'extraction** : sans conduit jusqu'en toiture, pas de cuisine chaude. C'est le point qui tue le plus de projets, et il se vérifie avant la signature.
- Demander les **diagnostics existants** et l'année de construction.
- Vérifier au **règlement de copropriété** que l'activité n'est pas interdite, et à quelles conditions.

### Avant de dessiner les travaux

- **Étude d'impact des nuisances sonores** si vous comptez diffuser de la musique amplifiée à niveau élevé, de façon habituelle.
- **Autorisation de travaux ERP**, qui vaut aussi pour l'accessibilité et la sécurité incendie. Délai d'instruction à anticiper — [et votre catégorie ne dépend pas du nombre de chaises](/blog/erp-restaurant-categorie-commission-securite).
- **Déclaration préalable** ou permis de construire selon l'ampleur, et pour toute modification de façade.

### Avant le premier coup de marteau

- **Repérage amiante avant travaux**, rapport transmis aux entreprises.
- **Constat plomb** si l'immeuble est antérieur à 1949.
- **Attestation de vigilance** de chaque entreprise au-delà de 5 000 €.

### Avant d'ouvrir les portes

- **Déclaration sanitaire** à la DDPP (Cerfa 13984), un mois avant.
- **Formation HACCP** : au moins une personne formée à l'hygiène alimentaire dans l'établissement — [et le classeur qu'on achète ne vous protège de rien](/blog/haccp-plan-maitrise-sanitaire-restaurant).
- **Permis d'exploitation** et **licence** si vous servez de l'alcool, à déclarer en mairie — [et la licence IV n'est pas celle qu'il vous faut](/blog/permis-exploitation-licence-restaurant).
- **SACEM et SPRE** si vous diffusez de la musique — [deux droits, une seule facture, et le piège Spotify](/blog/sacem-spre-restaurant-musique).
- **Autorisation d'occupation du domaine public** pour une terrasse — [et elle ne se vend pas avec le fonds](/blog/terrasse-restaurant-autorisation-domaine-public).
- **Passage de la commission de sécurité** selon votre catégorie d'ERP.

### Le jour de l'ouverture

- **Affichage des prix**, à l'extérieur et à l'intérieur.
- **Information sur les allergènes**.
- **Affichages obligatoires** pour le personnel.
- **Registre unique du personnel** dès le premier salarié.

## Ce que cet article ne peut pas faire

Il donne le cadre national et l'ordre des opérations. Trois choses lui échappent, et elles décident du reste :

- **votre catégorie d'ERP**, qui dépend de l'effectif accueilli ;
- **le règlement sanitaire départemental**, parfois plus strict que le texte national ;
- **le plan local d'urbanisme** de votre commune.

Ces trois-là se demandent à la mairie et à la préfecture. Personne ne peut y répondre à votre place, et un article qui prétendrait le contraire vous mettrait en danger.

---

*Cet article est tenu à jour à partir des textes en vigueur, chacun cité en bas de page. Les règles changent : vérifiez la date de mise à jour, et confirmez auprès de l'administration concernée avant d'engager une dépense.*
`,
};
