import type { Langue } from "@/lib/i18n/langue";

/**
 * Les réglages des réservations, dans les trois langues.
 *
 * Cinquième écran, et le dernier de ceux qui couvrent l'usage
 * quotidien : après lui, un restaurateur étranger peut décrire sa
 * maison, ouvrir ses créneaux, fermer ses congés et publier sa page sans
 * lire un mot de français.
 *
 * Il dit surtout **pourquoi** on lui demande ces choses-là — un espace
 * et un service ne sont pas des formulaires administratifs, ce sont les
 * deux données à partir desquelles Klarr calcule ce qui reste libre. Un
 * restaurateur qui ne l'a pas compris remplit mal, et se retrouve avec
 * une salle promise deux fois.
 *
 * Tout ce qui compte est une fonction : « 1 couvert » et « 2 couverts »
 * ne s'accordent pas pareil, l'anglais s'accorde autrement, et le chinois
 * ne s'accorde pas du tout mais réclame son classificateur — 位 pour une
 * personne à table, 张 pour une photo, 天 pour un jour.
 */

export type ClesConfiguration = {
  titre(restaurant: string): string;
  chapo: string;
  supprimer: string;
  modifier: string;
  enregistrer: string;
  enregistrement: string;
  fermer: string;
  facultatif: string;

  /** Les compteurs et le sommaire en tête de page. */
  compteurPage: string;
  pageEnLigneCourt: string;
  pageFermeeCourt: string;
  compteurEspaces(n: number, couverts: number): string;
  compteurServices(n: number): string;
  compteurFermetures(n: number): string;
  confirmationsCourt: string;
  nouvelEspace: string;
  nouveauService: string;
  nouvelleFermeture: string;

  espacesTitre: string;
  espacesChapo: string;
  couverts(n: number): string;
  reservationsIndividuelles: string;
  privatisationDes(minimum: number): string;
  acompteLisible(
    montant: string,
    parPersonne: boolean,
    seuil: number | null,
  ): string;
  cautionLisible(
    montant: string,
    parPersonne: boolean,
    seuil: number | null,
  ): string;
  photosDeCetEspace: string;
  photosChapo: string;

  nomEspace: string;
  nomEspacePlaceholder: string;
  capaciteCouverts: string;
  capacitePlaceholder: string;
  description: string;
  descriptionPlaceholder: string;
  individuellesLabel: string;
  individuellesAide: string;
  privatisationLabel: string;
  privatisationAide: string;
  aPartirDeCombien: string;
  sousCeNombre: string;
  garantieDemandee: string;
  garantieAucune: string;
  garantieAucuneAide: string;
  garantieAcompte: string;
  garantieAcompteAide: string;
  garantieCaution: string;
  garantieCautionAide: string;
  montantAcompteAria: string;
  modeAcompteAria: string;
  plafondCautionAria: string;
  modeCautionAria: string;
  auTotal: string;
  parCouvert: string;
  parPersonne: string;
  cautionNote: string;
  aPartirDe: string;
  convivesEnDessous: string;
  seuilAria: string;
  minimumConso: string;
  minimumConsoAide: string;
  ajouterCetEspace: string;

  choisisUnePhoto: string;
  pasUneImage: string;
  photoTropLourde: string;
  photoDeCetEspace: string;
  legendePhoto: string;
  legendePlaceholder: string;
  envoi: string;
  ajouterLaPhoto: string;

  servicesTitre: string;
  servicesChapo: string;
  nomDuService: string;
  nomServicePlaceholder: string;
  nomCourt: string;
  debut: string;
  fin: string;
  apresMinuit: string;
  dureeMoyenne: string;
  dureeAide: string;
  dureeAideMod: string;
  joursConcernes: string;
  delaiPrevenance: string;
  delaiAide: string;
  heuresIncompletes: string;
  champManquant: string;
  ajouterCeService: string;
  derniereMinute: string;
  prevenance(heures: number): string;

  confirmationsTitre: string;
  confirmationsChapo: string;
  confirmerAuto: string;
  confirmerAutoAide: string;
  saufAMoinsDe: string;
  saufAide: string;
  adresseQuiRecoit: string;
  adresseAide: string;
  adressePlaceholder: string;
  enregistre: string;

  fermeturesTitre: string;
  fermeturesChapo: string;
  espaceSupprime: string;
  espaceSeulement(nom: string): string;
  toutEtablissement: string;
  rouvrir: string;
  unSeulJour(date: string): string;
  duAu(debut: string, fin: string): string;
  du: string;
  au: string;
  videUnSeulJour: string;
  ceQuiFerme: string;
  motif: string;
  motifAide: string;
  motifPlaceholder: string;
  fermerCettePeriode: string;

  pageTitre: string;
  pageChapo: string;
  /** Le lien vers le module à coller sur le site du restaurant. */
  integrerSite: string;
  tonLogo: string;
  logoAide: string;
  logoActuel: string;
  aucunLogo: string;
  choisirLogo: string;
  remplacer: string;
  ajouterLogo: string;
  logoTropLourd: string;
  mentionsTitre: string;
  mentionsAide: string;
  mentionsPlaceholder: string;
  manqueSalleEtService: string;
  manqueSalle: string;
  manqueService: string;
  adresseEnLigneMais(manque: string): string;
  elleEstEnLigne: string;
  siteVitrine: string;
  vitrineProposition: string;
  laPageSiteVitrine: string;
  ajouteEspaceEtService: string;
  pasEncoreOuverte: string;
  ouvrirMaPage: string;
};

const s = (n: number) => (n > 1 ? "s" : "");

const fr: ClesConfiguration = {
  titre: (r) => `Réglages des réservations — ${r}`,
  chapo:
    "Décris tes espaces et tes services : Klarr s'en sert pour calculer ce qui reste disponible et pour empêcher qu'une salle soit promise deux fois. Un espace peut accueillir des tables classiques, se privatiser en entier, ou les deux.",
  supprimer: "Supprimer",
  modifier: "Modifier",
  enregistrer: "Enregistrer",
  enregistrement: "Enregistrement…",
  fermer: "Fermer",
  facultatif: "(facultatif)",

  compteurPage: "page de réservation",
  pageEnLigneCourt: "En ligne",
  pageFermeeCourt: "Fermée",
  compteurEspaces: (n, c) => `espace${s(n)} · ${c} couvert${s(c)} au total`,
  compteurServices: (n) => `service${s(n)} par semaine`,
  compteurFermetures: (n) => `fermeture${s(n)} à venir`,
  nouvelEspace: "Ajouter un espace",
  nouveauService: "Ajouter un service",
  nouvelleFermeture: "Fermer une période",
  confirmationsCourt: "Confirmations",
  espacesTitre: "Tes espaces",
  espacesChapo:
    "La salle principale, la terrasse, la cave — tout ce qui peut accueillir un groupe.",
  couverts: (n) => `${n} couvert${s(n)}`,
  reservationsIndividuelles: "Réservations individuelles",
  privatisationDes: (m) => `Privatisation dès ${m}`,
  acompteLisible: (montant, parPersonne, seuil) =>
    `Acompte ${montant} €${parPersonne ? " par personne" : ""}${
      seuil ? ` dès ${seuil} convives` : ""
    }`,
  cautionLisible: (montant, parPersonne, seuil) =>
    `Caution ${montant} €${parPersonne ? " par personne" : ""}${
      seuil ? ` dès ${seuil} convives` : ""
    }`,
  photosDeCetEspace: "Photos de cet espace",
  photosChapo: "— ce que verra le client avant de réserver",

  nomEspace: "Nom de l'espace",
  nomEspacePlaceholder: "Salle du bas",
  capaciteCouverts: "Capacité (couverts)",
  capacitePlaceholder: "40",
  description: "Description",
  descriptionPlaceholder: "Salle voûtée en sous-sol, accès indépendant",
  individuellesLabel: "Réservations individuelles",
  individuellesAide:
    "plusieurs groupes partagent l'espace en même temps, dans la limite de la capacité.",
  privatisationLabel: "Privatisation",
  privatisationAide: "un seul groupe occupe l'espace entier sur le créneau.",
  aPartirDeCombien: "À partir de combien de couverts ?",
  sousCeNombre:
    "Une demande en dessous de ce nombre sera refusée automatiquement.",
  garantieDemandee: "Garantie demandée au client",
  garantieAucune: "Aucune",
  garantieAucuneAide: "Le client réserve sans rien avancer.",
  garantieAcompte: "Acompte",
  garantieAcompteAide:
    "Il paie une somme d'avance, encaissée sur ton compte Stripe.",
  garantieCaution: "Carte en garantie",
  garantieCautionAide:
    "Rien n'est prélevé : tu ne débites qu'en cas de défection.",
  montantAcompteAria: "Montant de l'acompte en euros",
  modeAcompteAria: "Mode de calcul de l'acompte",
  plafondCautionAria: "Plafond de la caution en euros",
  modeCautionAria: "Mode de calcul de la caution",
  auTotal: "au total",
  parCouvert: "par couvert",
  parPersonne: "par personne",
  cautionNote:
    "Débitables seulement si le groupe ne vient pas. Rien n'est prélevé à la réservation.",
  aPartirDe: "À partir de",
  convivesEnDessous: "convives. En dessous, rien n'est demandé.",
  seuilAria: "Nombre de convives à partir duquel la garantie s'applique",
  minimumConso: "Minimum de consommation",
  minimumConsoAide:
    "Le client s'engage à consommer au moins ce montant. Rien n'est encaissé : c'est annoncé avant la réservation, et ça se règle à l'addition. Une privatisation d'entreprise se négocie en HT, un anniversaire en TTC.",
  ajouterCetEspace: "Ajouter cet espace",

  choisisUnePhoto: "Choisis une photo.",
  pasUneImage: "Ce fichier ne s'ouvre pas comme une image.",
  photoTropLourde:
    "Photo trop lourde (4 Mo maximum). Réduis-la avant de l'envoyer.",
  photoDeCetEspace: "Photo de cet espace",
  legendePhoto: "Légende de la photo",
  legendePlaceholder: "Légende (facultatif)",
  envoi: "Envoi…",
  ajouterLaPhoto: "Ajouter la photo",

  servicesTitre: "Tes services",
  servicesChapo:
    "Les créneaux pendant lesquels tu prends des réservations. Un déjeuner et un dîner comptent séparément : une salle privatisée à midi reste libre le soir.",
  nomDuService: "Nom du service",
  nomServicePlaceholder: "Dîner",
  nomCourt: "Nom",
  debut: "Début",
  fin: "Fin",
  apresMinuit:
    "Un service peut finir après minuit : saisis simplement 17h30 – 2h. Il restera rattaché au jour où il commence.",
  dureeMoyenne: "Durée moyenne d'une table (minutes)",
  dureeAide:
    "Elle fixe les heures d'arrivée proposées et libère la table pour les suivants. Deux heures le soir, une heure et demie le midi, en général.",
  dureeAideMod:
    "C'est elle qui fixe les heures d'arrivée proposées, et qui libère la table pour les suivants. Deux heures le soir, une heure et demie le midi, en général.",
  joursConcernes: "Jours concernés",
  delaiPrevenance: "Délai de prévenance (heures)",
  delaiAide:
    "Aucune demande ne sera acceptée en deçà de ce délai. Mets 0 pour accepter les demandes de dernière minute.",
  heuresIncompletes:
    "Renseigne les heures de début et de fin, au format 19:00.",
  champManquant:
    "Il manque quelque chose : le champ surligné n'est pas rempli.",
  ajouterCeService: "Ajouter ce service",
  derniereMinute: "Dernière minute acceptée",
  prevenance: (h) => `Prévenance ${h} h`,

  confirmationsTitre: "Confirmations et e-mails",
  confirmationsChapo:
    "Qui valide les réservations, et où elles arrivent. Le client est prévenu par e-mail dans tous les cas : confirmation immédiate si Klarr confirme, accusé de réception sinon.",
  confirmerAuto: "Confirmer les réservations automatiquement",
  confirmerAutoAide:
    "Les tables sont confirmées dès leur arrivée, et le client reçoit sa confirmation tout de suite. Les privatisations, elles, attendent toujours ton accord.",
  saufAMoinsDe: "Sauf à moins de (heures avant le service)",
  saufAide:
    "En deçà, c'est toi qui valides : une table pour ce soir mérite un coup d'œil, une table pour samedi prochain non. Mets 0 pour tout confirmer, y compris la dernière minute.",
  adresseQuiRecoit: "Adresse qui reçoit les réservations",
  adresseAide:
    "Chaque réservation t'y est signalée, et c'est à cette adresse que le client répond s'il a un empêchement. Laisse vide pour ne rien recevoir.",
  adressePlaceholder: "reservations@ton-restaurant.fr",
  enregistre: "Enregistré.",

  fermeturesTitre: "Fermetures",
  fermeturesChapo:
    "Congés, jour férié, salle déjà prise : ferme la période et plus rien ne s'y réserve, ni en ligne ni au téléphone. Tes services restent configurés, tu n'as rien à défaire.",
  espaceSupprime: "Espace supprimé",
  espaceSeulement: (nom) => `${nom} seulement`,
  toutEtablissement: "Tout l'établissement",
  rouvrir: "Rouvrir",
  unSeulJour: (date) => `Le ${date}`,
  duAu: (debut, fin) => `Du ${debut} au ${fin}`,
  du: "Du",
  au: "Au",
  videUnSeulJour: "(vide = un seul jour)",
  ceQuiFerme: "Ce qui ferme",
  motif: "Motif",
  motifAide: "(affiché au client)",
  motifPlaceholder: "Congés d'été",
  fermerCettePeriode: "Fermer cette période",

  pageTitre: "Ta page de réservation",
  pageChapo:
    "L'adresse à partager sur ta fiche Google, ton Instagram et ta page Facebook. Tes clients y voient uniquement ce qui est réellement disponible.",
  integrerSite: "Tu as déjà un site ? Mets-y ta réservation →",
  tonLogo: "Ton logo",
  logoAide: "— affiché en haut de ta page",
  logoActuel: "Logo actuel",
  aucunLogo: "Aucun logo — le nom de l'établissement s'affiche seul.",
  choisirLogo: "Choisir un logo",
  remplacer: "Remplacer",
  ajouterLogo: "Ajouter le logo",
  logoTropLourd:
    "Logo trop lourd (4 Mo maximum). Réduis-le avant de l'envoyer.",
  mentionsTitre: "Tes mentions légales",
  mentionsAide:
    "Affichées en bas de ta page de réservation. C'est toi qui contractes avec le client : raison sociale, SIRET, adresse, conditions d'annulation.",
  mentionsPlaceholder:
    "SARL Le Bistrot — SIRET 000 000 000 00000\n12 rue des Lilas, 75011 Paris\nAnnulation gratuite jusqu'à 48 h avant.",
  manqueSalleEtService: "une salle et un service",
  manqueSalle: "une salle",
  manqueService: "un service",
  adresseEnLigneMais: (m) =>
    `Ton adresse est en ligne, mais la page ne propose rien encore : il te manque ${m}. Ajoute-le plus haut sur cette page.`,
  elleEstEnLigne:
    "Elle est en ligne. Ouvre-la pour vérifier ce que voient tes clients.",
  siteVitrine: "Ton site vitrine",
  vitrineProposition:
    "Tu peux aussi ouvrir un site vitrine — une page qui rassemble tes photos, ta carte, tes horaires et cette adresse de réservation. Ça se publie depuis",
  laPageSiteVitrine: "la page Site vitrine",
  ajouteEspaceEtService:
    "Ajoute au moins un espace et un service : sans eux, la page n'aurait rien à proposer.",
  pasEncoreOuverte:
    "Ta page n'est pas encore ouverte. Elle recevra une adresse dérivée du nom de ton établissement.",
  ouvrirMaPage: "Ouvrir ma page de réservation",
};

const en: ClesConfiguration = {
  titre: (r) => `Booking settings — ${r}`,
  chapo:
    "Describe your rooms and your services: Klarr uses them to work out what is still available and to stop a room being promised twice. A room can take ordinary tables, be hired in full, or both.",
  supprimer: "Delete",
  modifier: "Edit",
  enregistrer: "Save",
  enregistrement: "Saving…",
  fermer: "Close",
  facultatif: "(optional)",

  compteurPage: "booking page",
  pageEnLigneCourt: "Online",
  pageFermeeCourt: "Closed",
  compteurEspaces: (n, c) => `room${s(n)} · ${c} cover${s(c)} in total`,
  compteurServices: (n) => `service${s(n)} a week`,
  compteurFermetures: (n) => `upcoming closure${s(n)}`,
  nouvelEspace: "Add a room",
  nouveauService: "Add a service",
  nouvelleFermeture: "Close a period",
  confirmationsCourt: "Confirmations",
  espacesTitre: "Your rooms",
  espacesChapo:
    "The main room, the terrace, the cellar — anything that can hold a party.",
  couverts: (n) => `${n} cover${s(n)}`,
  reservationsIndividuelles: "Individual bookings",
  privatisationDes: (m) => `Private hire from ${m}`,
  acompteLisible: (montant, parPersonne, seuil) =>
    `Deposit €${montant}${parPersonne ? " per person" : ""}${
      seuil ? ` from ${seuil} guest${s(seuil)}` : ""
    }`,
  cautionLisible: (montant, parPersonne, seuil) =>
    `Card hold €${montant}${parPersonne ? " per person" : ""}${
      seuil ? ` from ${seuil} guest${s(seuil)}` : ""
    }`,
  photosDeCetEspace: "Photos of this room",
  photosChapo: "— what the guest sees before booking",

  nomEspace: "Name of the room",
  nomEspacePlaceholder: "Downstairs room",
  capaciteCouverts: "Capacity (covers)",
  capacitePlaceholder: "40",
  description: "Description",
  descriptionPlaceholder: "Vaulted cellar room, its own entrance",
  individuellesLabel: "Individual bookings",
  individuellesAide:
    "several parties share the room at the same time, up to its capacity.",
  privatisationLabel: "Private hire",
  privatisationAide: "a single party takes the whole room for that slot.",
  aPartirDeCombien: "From how many covers?",
  sousCeNombre:
    "A request below this number will be turned down automatically.",
  garantieDemandee: "Guarantee asked of the guest",
  garantieAucune: "None",
  garantieAucuneAide: "The guest books without paying anything up front.",
  garantieAcompte: "Deposit",
  garantieAcompteAide:
    "They pay a sum in advance, collected into your Stripe account.",
  garantieCaution: "Card on file",
  garantieCautionAide:
    "Nothing is taken: you only charge the card if they fail to show.",
  montantAcompteAria: "Deposit amount in euros",
  modeAcompteAria: "How the deposit is worked out",
  plafondCautionAria: "Card hold ceiling in euros",
  modeCautionAria: "How the card hold is worked out",
  auTotal: "in total",
  parCouvert: "per cover",
  parPersonne: "per person",
  cautionNote:
    "Chargeable only if the party does not turn up. Nothing is taken at the time of booking.",
  aPartirDe: "From",
  convivesEnDessous: "guests. Below that, nothing is asked.",
  seuilAria: "Number of guests from which the guarantee applies",
  minimumConso: "Minimum spend",
  minimumConsoAide:
    "The guest undertakes to spend at least this much. Nothing is collected: it is stated before booking and settled on the bill. A company hire is negotiated excluding VAT, a birthday including it.",
  ajouterCetEspace: "Add this room",

  choisisUnePhoto: "Choose a photo.",
  pasUneImage: "This file does not open as an image.",
  photoTropLourde: "Photo too heavy (4 MB maximum). Shrink it before sending.",
  photoDeCetEspace: "Photo of this room",
  legendePhoto: "Photo caption",
  legendePlaceholder: "Caption (optional)",
  envoi: "Sending…",
  ajouterLaPhoto: "Add the photo",

  servicesTitre: "Your services",
  servicesChapo:
    "The slots during which you take bookings. Lunch and dinner count separately: a room hired at midday is free again in the evening.",
  nomDuService: "Name of the service",
  nomServicePlaceholder: "Dinner",
  nomCourt: "Name",
  debut: "Start",
  fin: "End",
  apresMinuit:
    "A service can end after midnight: just enter 17:30 – 02:00. It stays attached to the day it begins.",
  dureeMoyenne: "Average length of a sitting (minutes)",
  dureeAide:
    "It sets the arrival times on offer and frees the table for the next party. Two hours in the evening, an hour and a half at lunch, as a rule.",
  dureeAideMod:
    "This is what sets the arrival times on offer, and what frees the table for the next party. Two hours in the evening, an hour and a half at lunch, as a rule.",
  joursConcernes: "Days concerned",
  delaiPrevenance: "Notice required (hours)",
  delaiAide:
    "No request will be accepted inside this window. Put 0 to accept last-minute requests.",
  heuresIncompletes: "Fill in the start and end times, in 19:00 form.",
  champManquant: "Something is missing: the highlighted field is empty.",
  ajouterCeService: "Add this service",
  derniereMinute: "Last minute accepted",
  prevenance: (h) => `${h} h notice`,

  confirmationsTitre: "Confirmations and emails",
  confirmationsChapo:
    "Who approves bookings, and where they land. The guest is emailed either way: an immediate confirmation if Klarr confirms, an acknowledgement otherwise.",
  confirmerAuto: "Confirm bookings automatically",
  confirmerAutoAide:
    "Tables are confirmed the moment they come in, and the guest gets their confirmation straight away. Private hires always wait for your approval.",
  saufAMoinsDe: "Except within (hours before the service)",
  saufAide:
    "Inside that window you approve them yourself: a table for tonight deserves a look, a table for next Saturday does not. Put 0 to confirm everything, last minute included.",
  adresseQuiRecoit: "Address that receives the bookings",
  adresseAide:
    "Every booking is flagged to you there, and that is the address the guest replies to if something comes up. Leave it empty to receive nothing.",
  adressePlaceholder: "bookings@your-restaurant.com",
  enregistre: "Saved.",

  fermeturesTitre: "Closures",
  fermeturesChapo:
    "Holidays, a bank holiday, a room already taken: close the period and nothing can be booked in it, online or by phone. Your services stay configured — there is nothing to undo.",
  espaceSupprime: "Deleted room",
  espaceSeulement: (nom) => `${nom} only`,
  toutEtablissement: "The whole establishment",
  rouvrir: "Reopen",
  unSeulJour: (date) => `On ${date}`,
  duAu: (debut, fin) => `From ${debut} to ${fin}`,
  du: "From",
  au: "To",
  videUnSeulJour: "(empty = a single day)",
  ceQuiFerme: "What closes",
  motif: "Reason",
  motifAide: "(shown to the guest)",
  motifPlaceholder: "Summer holidays",
  fermerCettePeriode: "Close this period",

  pageTitre: "Your booking page",
  pageChapo:
    "The address to share on your Google listing, your Instagram and your Facebook page. Your guests only see what is genuinely available.",
  integrerSite: "Already have a website? Add your booking to it →",
  tonLogo: "Your logo",
  logoAide: "— shown at the top of your page",
  logoActuel: "Current logo",
  aucunLogo: "No logo — the establishment's name stands on its own.",
  choisirLogo: "Choose a logo",
  remplacer: "Replace",
  ajouterLogo: "Add the logo",
  logoTropLourd: "Logo too heavy (4 MB maximum). Shrink it before sending.",
  mentionsTitre: "Your legal notice",
  mentionsAide:
    "Shown at the foot of your booking page. You are the one contracting with the guest: company name, registration number, address, cancellation terms.",
  mentionsPlaceholder:
    "Le Bistrot Ltd — company no. 00000000\n12 rue des Lilas, 75011 Paris\nFree cancellation up to 48 h beforehand.",
  manqueSalleEtService: "a room and a service",
  manqueSalle: "a room",
  manqueService: "a service",
  adresseEnLigneMais: (m) =>
    `Your address is live, but the page has nothing to offer yet: you are missing ${m}. Add it higher up this page.`,
  elleEstEnLigne: "It is live. Open it to check what your guests see.",
  siteVitrine: "Your website",
  vitrineProposition:
    "You can also open a website — a page gathering your photos, your menu, your opening hours and this booking address. It is published from",
  laPageSiteVitrine: "the Website page",
  ajouteEspaceEtService:
    "Add at least one room and one service: without them the page would have nothing to offer.",
  pasEncoreOuverte:
    "Your page is not open yet. It will get an address derived from your establishment's name.",
  ouvrirMaPage: "Open my booking page",
};

const zh: ClesConfiguration = {
  titre: (r) => `订位设置 — ${r}`,
  chapo:
    "请描述您的场地和服务时段：Klarr 用它们来计算还剩多少可订，并避免同一个厅被答应给两拨人。一个场地可以接散客、可以整体包场，也可以两者都行。",
  supprimer: "删除",
  modifier: "修改",
  enregistrer: "保存",
  enregistrement: "正在保存…",
  fermer: "关闭",
  facultatif: "（选填）",

  compteurPage: "订位页",
  pageEnLigneCourt: "已上线",
  pageFermeeCourt: "未开放",
  compteurEspaces: (_n, c) => `个场地 · 共 ${c} 位`,
  compteurServices: () => `个服务时段`,
  compteurFermetures: () => `个即将到来的休息日`,
  nouvelEspace: "添加场地",
  nouveauService: "添加服务时段",
  nouvelleFermeture: "设置休息日",
  confirmationsCourt: "确认",
  espacesTitre: "您的场地",
  espacesChapo: "主厅、露台、地窖——凡是能接待一桌人的地方。",
  couverts: (n) => `${n} 位`,
  reservationsIndividuelles: "接受散客订位",
  privatisationDes: (m) => `满 ${m} 位可包场`,
  acompteLisible: (montant, parPersonne, seuil) =>
    `定金 ${montant} 欧元${parPersonne ? "／人" : ""}${
      seuil ? `（满 ${seuil} 位起）` : ""
    }`,
  cautionLisible: (montant, parPersonne, seuil) =>
    `信用卡担保 ${montant} 欧元${parPersonne ? "／人" : ""}${
      seuil ? `（满 ${seuil} 位起）` : ""
    }`,
  photosDeCetEspace: "这个场地的照片",
  photosChapo: "— 客人订位前会看到的",

  nomEspace: "场地名称",
  nomEspacePlaceholder: "楼下厅",
  capaciteCouverts: "容纳人数（位）",
  capacitePlaceholder: "40",
  description: "描述",
  descriptionPlaceholder: "地下拱顶厅，有独立入口",
  individuellesLabel: "接受散客订位",
  individuellesAide: "在容纳人数以内，几桌客人同时共用这个场地。",
  privatisationLabel: "整体包场",
  privatisationAide: "这个时段里，整个场地只招待一拨客人。",
  aPartirDeCombien: "满多少位才能包场？",
  sousCeNombre: "低于这个人数的申请会被自动婉拒。",
  garantieDemandee: "向客人收取的担保",
  garantieAucune: "不收",
  garantieAucuneAide: "客人订位时不用先付任何钱。",
  garantieAcompte: "定金",
  garantieAcompteAide: "客人先付一笔钱，直接进您的 Stripe 账户。",
  garantieCaution: "信用卡担保",
  garantieCautionAide: "不扣款：只有客人放鸽子时您才扣。",
  montantAcompteAria: "定金金额（欧元）",
  modeAcompteAria: "定金的计算方式",
  plafondCautionAria: "担保上限（欧元）",
  modeCautionAria: "担保的计算方式",
  auTotal: "按总额",
  parCouvert: "按每位",
  parPersonne: "按每人",
  cautionNote: "只有客人没来才能扣。订位时不扣任何钱。",
  aPartirDe: "满",
  convivesEnDessous: "位起。不到这个人数，什么都不收。",
  seuilAria: "从多少位客人起开始收担保",
  minimumConso: "最低消费",
  minimumConsoAide:
    "客人承诺至少消费这个金额。不预收：订位前就写明，结账时一起付。企业包场一般谈不含税价，生日聚会谈含税价。",
  ajouterCetEspace: "添加这个场地",

  choisisUnePhoto: "请选一张照片。",
  pasUneImage: "这个文件打不开，不是图片。",
  photoTropLourde: "照片太大（最多 4 MB）。请先压缩再上传。",
  photoDeCetEspace: "这个场地的照片",
  legendePhoto: "照片说明",
  legendePlaceholder: "说明（选填）",
  envoi: "正在上传…",
  ajouterLaPhoto: "添加照片",

  servicesTitre: "您的服务时段",
  servicesChapo:
    "您接受订位的时间段。午市和晚市分开计算：中午被包下的厅，晚上仍然是空的。",
  nomDuService: "服务时段名称",
  nomServicePlaceholder: "晚市",
  nomCourt: "名称",
  debut: "开始",
  fin: "结束",
  apresMinuit:
    "服务时段可以跨过午夜：直接填 17:30 – 02:00 就行。它仍然算在开始的那一天。",
  dureeMoyenne: "一桌平均用餐时长（分钟）",
  dureeAide:
    "它决定给客人提供哪些到店时间，并把桌子腾给下一拨。一般晚上两小时，中午一个半小时。",
  dureeAideMod:
    "正是它决定给客人提供哪些到店时间，也正是它把桌子腾给下一拨。一般晚上两小时，中午一个半小时。",
  joursConcernes: "适用的星期",
  delaiPrevenance: "最短提前时间（小时）",
  delaiAide: "比这更晚的申请一律不接受。填 0 表示临时订位也接受。",
  heuresIncompletes: "请填写开始和结束时间，格式如 19:00。",
  champManquant: "还差一点：高亮的那一栏没填。",
  ajouterCeService: "添加这个服务时段",
  derniereMinute: "接受临时订位",
  prevenance: (h) => `需提前 ${h} 小时`,

  confirmationsTitre: "确认与邮件",
  confirmationsChapo:
    "谁来批准订位，以及订位到哪里。无论哪种方式，客人都会收到邮件：Klarr 自动确认时是确认函，否则是收到申请的回执。",
  confirmerAuto: "自动确认订位",
  confirmerAutoAide:
    "订位一进来就确认，客人马上收到确认函。包场则始终要等您点头。",
  saufAMoinsDe: "但不足这么久的除外（服务开始前几小时）",
  saufAide:
    "在这个时间之内，由您亲自批：今晚的一桌值得看一眼，下周六的就不必。填 0 表示全部自动确认，临时订位也一样。",
  adresseQuiRecoit: "接收订位的邮箱",
  adresseAide:
    "每一笔订位都会通知到这个邮箱，客人临时有事也是回复到这个地址。留空就什么都不收。",
  adressePlaceholder: "reservations@nin-de-canting.com",
  enregistre: "已保存。",

  fermeturesTitre: "停业与封场",
  fermeturesChapo:
    "休假、节假日、厅已被占用：把这段时间关掉，就再也订不进来，线上线下都一样。您的服务时段设置保持不变，不用逐个撤销。",
  espaceSupprime: "已删除的场地",
  espaceSeulement: (nom) => `仅 ${nom}`,
  toutEtablissement: "整家店",
  rouvrir: "重新开放",
  unSeulJour: (date) => date,
  duAu: (debut, fin) => `${debut} 至 ${fin}`,
  du: "从",
  au: "到",
  videUnSeulJour: "（留空＝只关一天）",
  ceQuiFerme: "关掉什么",
  motif: "原因",
  motifAide: "（会显示给客人）",
  motifPlaceholder: "暑期休假",
  fermerCettePeriode: "关闭这段时间",

  pageTitre: "您的订位页",
  pageChapo:
    "这个网址可以放到 Google 商家资料、Instagram 和 Facebook 主页上。客人在上面看到的，只有真正还能订的时段。",
  integrerSite: "已有网站？把订位功能放进去 →",
  tonLogo: "您的店标",
  logoAide: "— 显示在页面顶部",
  logoActuel: "当前店标",
  aucunLogo: "没有店标——页面上只显示店名。",
  choisirLogo: "选择店标",
  remplacer: "更换",
  ajouterLogo: "添加店标",
  logoTropLourd: "店标太大（最多 4 MB）。请先压缩再上传。",
  mentionsTitre: "您的法律声明",
  mentionsAide:
    "显示在订位页底部。和客人签约的是您，不是 Klarr：公司名称、工商注册号、地址、取消条件。",
  mentionsPlaceholder:
    "Le Bistrot 有限公司 — SIRET 000 000 000 00000\n巴黎 75011 区 rue des Lilas 12 号\n提前 48 小时以上取消不收费。",
  manqueSalleEtService: "一个场地和一个服务时段",
  manqueSalle: "一个场地",
  manqueService: "一个服务时段",
  adresseEnLigneMais: (m) =>
    `您的网址已经上线，但页面上还没有可订的内容：还缺${m}。请在本页上方添加。`,
  elleEstEnLigne: "已经上线。打开看看客人看到的是什么样子。",
  siteVitrine: "您的官网",
  vitrineProposition:
    "您还可以开一个官网——一个把照片、菜单、营业时间和这个订位网址汇总在一起的页面。可以从",
  laPageSiteVitrine: "「官网」页面",
  ajouteEspaceEtService:
    "至少添加一个场地和一个服务时段：没有它们，这个页面没有任何东西可以提供。",
  pasEncoreOuverte: "您的页面还没有开通。开通后会根据店名自动生成一个网址。",
  ouvrirMaPage: "开通我的订位页",
};

export const CONFIGURATION: Record<Langue, ClesConfiguration> = { fr, en, zh };
