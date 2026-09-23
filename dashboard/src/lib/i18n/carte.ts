import type { Langue } from "@/lib/i18n/langue";

/**
 * L'écran de la carte, dans les trois langues.
 *
 * C'est le premier écran qu'un restaurateur remplit, et celui qu'un
 * restaurateur étranger remplira le jour de son arrivée : sa carte, il
 * l'a en tête, mais pas le vocabulaire français pour la saisir.
 *
 * Même règle que le carnet — une chaîne quand la phrase est figée, une
 * fonction dès qu'elle compte. Ici ça compte beaucoup : des plats, des
 * photos, des catégories, des langues à traduire.
 *
 * Les libellés des boutons d'action portent le nom du plat (« Monter
 * Tarte Tatin ») : ce sont des `aria-label`, lus à voix haute par un
 * lecteur d'écran, et une flèche sans nom n'y dit rien du tout.
 */

export type ClesCarte = {
  titre(restaurant: string): string;
  chapo: string;

  allergenesManquants(n: number): string;
  allergenesRappel: string;

  visible: string;
  privee: string;
  platsALaCarte(n: number): string;
  decroches(n: number): string;
  voirMaPage: string;
  retirerCarte: string;
  publierCarte: string;
  retirerDeMaPage: string;
  publierSurMaPage: string;

  traductionTitre: string;
  traductionChapo: string;

  qrReserve(module: string, prix: string): string;
  qrTitre: string;
  qrChapo: string;
  qrPng: string;
  qrSvg: string;
  qrPublieDabord: string;
  qrPasDeSlug: string;

  aucunPlat: string;
  /** Les compteurs en tête d'écran, et les titres des deux sections. */
  compteurALaCarte(n: number): string;
  compteurDecroches(n: number): string;
  compteurSansAllergenes(n: number): string;
  titreAjouter: string;
  fermerFormulaire: string;
  titrePlats: string;
  nombrePlats(n: number): string;
  deplacerCategorie: string;
  monter(quoi: string): string;
  descendre(quoi: string): string;
  decroche: string;
  anglaisARefaire: string;
  decrocher: string;
  remettre: string;
  decrocherPlat(nom: string): string;
  remettrePlat(nom: string): string;
  supprimer: string;
  supprimerPlat(nom: string): string;

  /** Le formulaire d'ajout d'un plat. */
  champCategorie: string;
  categorieLibre: string;
  placeholderCategorie: string;
  aideCategorie: string;
  champPlat: string;
  placeholderPlat: string;
  champDescription: string;
  facultatif: string;
  placeholderDescription: string;
  champPrix: string;
  prixVide: string;
  placeholderPrix: string;
  ajouterALaCarte: string;
  ajoutEnCours: string;

  /** La photo, les allergènes, les formats. */
  ajouterPhoto(nom: string): string;
  remplacerPhoto(nom: string): string;
  retirerPhoto: string;
  photoIllisible: string;
  photoTropLourde: string;
  choisirPhoto: string;
  photoReduite(largeur: number, hauteur: number, poids: string): string;
  allergenesADeclarer: string;
  aucunAllergene: string;
  allergenesDe(nom: string): string;
  enregistrer: string;
  enregistrementEnCours: string;
  allergenesRienCoche: string;
  formatsPrixUnique: string;
  formatsDe(nom: string): string;
  libelleFormat(rang: number): string;
  prixFormat(rang: number): string;
  enregistrerFormats: string;
  formatsPrennentLaPlace: string;

  /** Le bouton de traduction. */
  traduireEn(langue: string): string;
  traduireReste(langue: string, reste: number): string;
  aJour(langue: string): string;
  traductionEnCours: string;
  dejaTraduit(langue: string): string;
  platsTraduits(n: number, langue: string): string;
};

const s = (n: number) => (n > 1 ? "s" : "");

const fr: ClesCarte = {
  titre: (r) => `Carte — ${r}`,
  chapo:
    "Ta carte s'affiche sur ta page de réservation, sous les disponibilités : le client sait ce qu'il vient manger avant de demander une table. Les catégories apparaissent dans l'ordre où tu les ranges ici, pas par ordre alphabétique. Le carré à gauche de chaque plat ajoute sa photo : un carpaccio photographié se commande plus qu'un carpaccio décrit.",
  allergenesManquants: (n) => `${n} plat${s(n)} sans allergènes déclarés`,
  allergenesRappel:
    "La loi demande que la liste des allergènes soit écrite et consultable sans que le client ait à la demander. Coche-les sous chaque plat : ta carte les affiche, et ton document allergènes se fabrique tout seul à partir de là.",
  visible: "Ta carte est visible par tes clients.",
  privee: "Ta carte n'est visible que par toi.",
  platsALaCarte: (n) => `${n} plat${s(n)} à la carte`,
  decroches: (n) => ` · ${n} décroché${s(n)}`,
  voirMaPage: "voir ma page",
  retirerCarte: "Retirer la carte",
  publierCarte: "Publier la carte",
  retirerDeMaPage: "Retirer de ma page",
  publierSurMaPage: "Publier sur ma page",
  traductionTitre: "Ta carte en plusieurs langues",
  traductionChapo:
    "Le client choisit sa langue en haut de ta carte. Une langue n'apparaît que si elle est vraiment traduite. Un plat que tu corriges en français repasse en français tant qu'il n'est pas retraduit — mieux vaut ça qu'une carte étrangère qui ment sur ce qu'il y a dans l'assiette.",
  qrReserve: (module, prix) =>
    `Ta carte s'affiche déjà sur ta page de réservation. Le QR code à poser sur les tables et la traduction font partie de ${module} — ${prix}.`,
  qrTitre: "Le QR code de ta carte",
  qrChapo:
    "Imprime-le et pose-le sur tes tables : le client scanne et lit ta carte sur son téléphone, sans rien installer.",
  qrPng: "Télécharger (PNG)",
  qrSvg: "Version imprimeur (SVG)",
  qrPublieDabord:
    "Publie ta carte pour obtenir son QR code : un QR posé sur trente tables qui mène à une page vide est pire que pas de QR du tout.",
  qrPasDeSlug:
    "Ouvre d'abord ta page de réservation dans la configuration : c'est elle qui donne l'adresse que le QR code encodera.",
  aucunPlat:
    "Aucun plat pour l'instant. Commence par tes entrées : les catégories s'afficheront dans l'ordre où tu les ajoutes.",
  compteurALaCarte: (n) => `plat${s(n)} à la carte`,
  compteurDecroches: (n) => `décroché${s(n)}`,
  compteurSansAllergenes: (n) => `sans allergènes déclarés`,
  fermerFormulaire: "Fermer",
  titreAjouter: "Ajouter un plat",
  titrePlats: "Votre carte",
  nombrePlats: (n) => `${n} plat${s(n)}`,
  deplacerCategorie: "Déplacer la catégorie",
  monter: (q) => `Monter ${q}`,
  descendre: (q) => `Descendre ${q}`,
  decroche: "décroché",
  anglaisARefaire: "anglais à refaire",
  decrocher: "Décrocher",
  remettre: "Remettre",
  decrocherPlat: (n) => `Décrocher ${n}`,
  remettrePlat: (n) => `Remettre ${n}`,
  supprimer: "Supprimer",
  supprimerPlat: (n) => `Supprimer ${n}`,
  champCategorie: "Catégorie",
  categorieLibre: "(choisis ou écris la tienne)",
  placeholderCategorie: "Entrées, Tapas, Menu du midi…",
  aideCategorie:
    "Tape ce que tu veux : une catégorie qui n'existe pas encore se crée en validant, et se range ensuite avec les flèches.",
  champPlat: "Plat",
  placeholderPlat: "Œuf parfait, crème de champignons",
  champDescription: "Description",
  facultatif: "(facultatif)",
  placeholderDescription: "Girolles, noisettes torréfiées",
  champPrix: "Prix",
  prixVide: "(vide = non affiché)",
  placeholderPrix: "14,50",
  ajouterALaCarte: "Ajouter à la carte",
  ajoutEnCours: "Ajout…",
  ajouterPhoto: (n) => `Ajouter une photo à ${n}`,
  remplacerPhoto: (n) => `Remplacer la photo de ${n}`,
  retirerPhoto: "Retirer",
  photoIllisible: "Ce fichier ne s'ouvre pas comme une image.",
  photoTropLourde: "Photo trop lourde (4 Mo maximum).",
  choisirPhoto: "Choisis une photo.",
  photoReduite: (l, h, p) => `Réduite à ${l} × ${h} px (${p}).`,
  allergenesADeclarer: "allergènes à déclarer",
  aucunAllergene: "Aucun allergène déclaré",
  allergenesDe: (n) => `Allergènes de ${n}`,
  enregistrer: "Enregistrer",
  enregistrementEnCours: "Enregistrement…",
  allergenesRienCoche:
    "Enregistrer sans rien cocher déclare que ce plat n'en contient aucun.",
  formatsPrixUnique: "Prix unique — vendu aussi par 6, par 12 ?",
  formatsDe: (n) => `Formats de ${n}. Tout vider revient au prix unique.`,
  libelleFormat: (r) => `Libellé du format ${r}`,
  prixFormat: (r) => `Prix du format ${r}`,
  enregistrerFormats: "Enregistrer les formats",
  formatsPrennentLaPlace:
    "Tant qu'il y a des formats, ce sont eux qui s'affichent sur la carte, pas le prix du plat.",
  traduireEn: (l) => `Traduire en ${l}`,
  traduireReste: (l, n) => `Traduire en ${l} (${n})`,
  aJour: (l) => `${l} à jour`,
  traductionEnCours: "Traduction…",
  dejaTraduit: (l) => `Tout était déjà traduit en ${l}.`,
  platsTraduits: (n, l) => `${n} plat${s(n)} traduit${s(n)} en ${l}.`,
};

const en: ClesCarte = {
  titre: (r) => `Menu — ${r}`,
  chapo:
    "Your menu appears on your booking page, under the availability: the guest knows what they are coming to eat before asking for a table. Categories appear in the order you arrange them here, not alphabetically. The square to the left of each dish adds its photo: a photographed carpaccio is ordered more often than a described one.",
  allergenesManquants: (n) =>
    `${n} dish${n > 1 ? "es" : ""} with no allergens declared`,
  allergenesRappel:
    "The law requires the allergen list to be written down and available without the guest having to ask. Tick them under each dish: your menu shows them, and your allergen sheet is built from that on its own.",
  visible: "Your menu is visible to your guests.",
  privee: "Your menu is visible to you only.",
  platsALaCarte: (n) => `${n} dish${n > 1 ? "es" : ""} on the menu`,
  decroches: (n) => ` · ${n} taken down`,
  voirMaPage: "see my page",
  retirerCarte: "Take the menu down",
  publierCarte: "Publish the menu",
  retirerDeMaPage: "Take off my page",
  publierSurMaPage: "Publish on my page",
  traductionTitre: "Your menu in several languages",
  traductionChapo:
    "The guest picks their language at the top of your menu. A language only appears once it is really translated. A dish you correct in French falls back to French until it is translated again — better that than a foreign menu that lies about what is on the plate.",
  qrReserve: (module, prix) =>
    `Your menu already appears on your booking page. The QR code for the tables and the translation are part of ${module} — ${prix}.`,
  qrTitre: "Your menu's QR code",
  qrChapo:
    "Print it and put it on your tables: the guest scans it and reads your menu on their phone, with nothing to install.",
  qrPng: "Download (PNG)",
  qrSvg: "Print version (SVG)",
  qrPublieDabord:
    "Publish your menu to get its QR code: a QR on thirty tables leading to an empty page is worse than no QR at all.",
  qrPasDeSlug:
    "Open your booking page in the settings first: that is what gives the address the QR code will encode.",
  aucunPlat:
    "No dish yet. Start with your starters: categories will appear in the order you add them.",
  compteurALaCarte: (n) =>
    n === 1 ? "dish on the menu" : "dishes on the menu",
  compteurDecroches: () => "taken off",
  compteurSansAllergenes: () => "without declared allergens",
  fermerFormulaire: "Close",
  titreAjouter: "Add a dish",
  titrePlats: "Your menu",
  nombrePlats: (n) => `${n} dish${n === 1 ? "" : "es"}`,
  deplacerCategorie: "Move the category",
  monter: (q) => `Move ${q} up`,
  descendre: (q) => `Move ${q} down`,
  decroche: "taken down",
  anglaisARefaire: "English to redo",
  decrocher: "Take down",
  remettre: "Put back",
  decrocherPlat: (n) => `Take ${n} down`,
  remettrePlat: (n) => `Put ${n} back`,
  supprimer: "Delete",
  supprimerPlat: (n) => `Delete ${n}`,
  champCategorie: "Category",
  categorieLibre: "(pick one or write your own)",
  placeholderCategorie: "Starters, Tapas, Set lunch…",
  aideCategorie:
    "Type anything: a category that does not exist yet is created when you save, and is then reordered with the arrows.",
  champPlat: "Dish",
  placeholderPlat: "Slow-cooked egg, mushroom cream",
  champDescription: "Description",
  facultatif: "(optional)",
  placeholderDescription: "Girolles, roasted hazelnuts",
  champPrix: "Price",
  prixVide: "(empty = not shown)",
  placeholderPrix: "14.50",
  ajouterALaCarte: "Add to the menu",
  ajoutEnCours: "Adding…",
  ajouterPhoto: (n) => `Add a photo to ${n}`,
  remplacerPhoto: (n) => `Replace the photo of ${n}`,
  retirerPhoto: "Remove",
  photoIllisible: "That file does not open as an image.",
  photoTropLourde: "Photo too heavy (4 MB maximum).",
  choisirPhoto: "Pick a photo.",
  photoReduite: (l, h, p) => `Resized to ${l} × ${h} px (${p}).`,
  allergenesADeclarer: "allergens to declare",
  aucunAllergene: "No allergen declared",
  allergenesDe: (n) => `Allergens in ${n}`,
  enregistrer: "Save",
  enregistrementEnCours: "Saving…",
  allergenesRienCoche:
    "Saving with nothing ticked declares that this dish contains none of them.",
  formatsPrixUnique: "Single price — also sold by 6, by 12?",
  formatsDe: (n) =>
    `Formats for ${n}. Clearing them all goes back to one price.`,
  libelleFormat: (r) => `Label of format ${r}`,
  prixFormat: (r) => `Price of format ${r}`,
  enregistrerFormats: "Save the formats",
  formatsPrennentLaPlace:
    "As long as there are formats, they are what the menu shows, not the dish price.",
  traduireEn: (l) => `Translate into ${l}`,
  traduireReste: (l, n) => `Translate into ${l} (${n})`,
  aJour: (l) => `${l} up to date`,
  traductionEnCours: "Translating…",
  dejaTraduit: (l) => `Everything was already translated into ${l}.`,
  platsTraduits: (n, l) =>
    `${n} dish${n > 1 ? "es" : ""} translated into ${l}.`,
};

const zh: ClesCarte = {
  titre: (r) => `菜单 — ${r}`,
  chapo:
    "您的菜单会显示在订位页上、可订时段的下方：客人在开口订桌之前，就知道自己来吃什么。分类按您在这里排列的顺序显示，不按字母排序。每道菜左边的方块用来添加照片——有照片的生牛肉片，点的人比只有文字描述的多。",
  allergenesManquants: (n) => `${n} 道菜还没有申报过敏原`,
  allergenesRappel:
    "法律要求过敏原清单必须写明，并且客人不用开口问就能看到。在每道菜下面勾选即可：菜单会显示它们，您的过敏原对照表也会据此自动生成。",
  visible: "您的菜单客人可以看到。",
  privee: "您的菜单目前只有您自己能看到。",
  platsALaCarte: (n) => `菜单上有 ${n} 道菜`,
  decroches: (n) => ` · ${n} 道已下架`,
  voirMaPage: "查看我的页面",
  retirerCarte: "下架菜单",
  publierCarte: "发布菜单",
  retirerDeMaPage: "从我的页面撤下",
  publierSurMaPage: "发布到我的页面",
  traductionTitre: "多语言菜单",
  traductionChapo:
    "客人在菜单顶部自行选择语言。只有真正翻译过的语言才会出现。某道菜您在法语里改动过，它就会回到法语显示，直到重新翻译为止——这总好过一份对盘子里有什么说谎的外语菜单。",
  qrReserve: (module, prix) =>
    `您的菜单已经显示在订位页上。放在桌上的二维码和多语言翻译属于${module}模块 — ${prix}。`,
  qrTitre: "菜单二维码",
  qrChapo: "打印出来放在桌上：客人一扫就能在手机上看菜单，什么都不用装。",
  qrPng: "下载（PNG）",
  qrSvg: "印刷版（SVG）",
  qrPublieDabord:
    "先发布菜单才能生成二维码：三十张桌上贴着一个通向空白页的二维码，比没有二维码还糟。",
  qrPasDeSlug: "请先在设置里开通您的订位页：二维码要编码的网址来自那里。",
  aucunPlat: "目前还没有菜品。先从前菜开始：分类会按您添加的顺序出现。",
  compteurALaCarte: () => "道菜在菜单上",
  compteurDecroches: () => "道已下架",
  compteurSansAllergenes: () => "道未标注过敏原",
  fermerFormulaire: "收起",
  titreAjouter: "添加菜品",
  titrePlats: "您的菜单",
  nombrePlats: (n) => `${n} 道菜`,
  deplacerCategorie: "移动分类",
  monter: (q) => `将${q}上移`,
  descendre: (q) => `将${q}下移`,
  decroche: "已下架",
  anglaisARefaire: "英文需重做",
  decrocher: "下架",
  remettre: "重新上架",
  decrocherPlat: (n) => `将${n}下架`,
  remettrePlat: (n) => `将${n}重新上架`,
  supprimer: "删除",
  supprimerPlat: (n) => `删除${n}`,
  champCategorie: "分类",
  categorieLibre: "（选一个，或自己写）",
  placeholderCategorie: "前菜、小食、午市套餐…",
  aideCategorie:
    "想写什么都行：还不存在的分类，保存时就会自动创建，之后可以用箭头调整顺序。",
  champPlat: "菜名",
  placeholderPlat: "溏心蛋配蘑菇酱",
  champDescription: "描述",
  facultatif: "（选填）",
  placeholderDescription: "鸡油菌、烤榛子",
  champPrix: "价格",
  prixVide: "（留空＝不显示）",
  placeholderPrix: "14,50",
  ajouterALaCarte: "加入菜单",
  ajoutEnCours: "正在添加…",
  ajouterPhoto: (n) => `给${n}添加照片`,
  remplacerPhoto: (n) => `更换${n}的照片`,
  retirerPhoto: "移除",
  photoIllisible: "这个文件打不开，不是图片。",
  photoTropLourde: "照片太大（最多 4 MB）。",
  choisirPhoto: "请选一张照片。",
  photoReduite: (l, h, p) => `已压缩到 ${l} × ${h} 像素（${p}）。`,
  allergenesADeclarer: "待申报过敏原",
  aucunAllergene: "未申报任何过敏原",
  allergenesDe: (n) => `${n}的过敏原`,
  enregistrer: "保存",
  enregistrementEnCours: "正在保存…",
  allergenesRienCoche: "一个都不勾选就保存，等于声明这道菜不含任何过敏原。",
  formatsPrixUnique: "单一价格 — 是否也按 6 只、12 只出售？",
  formatsDe: (n) => `${n}的规格。全部清空即回到单一价格。`,
  libelleFormat: (r) => `第 ${r} 个规格的名称`,
  prixFormat: (r) => `第 ${r} 个规格的价格`,
  enregistrerFormats: "保存规格",
  formatsPrennentLaPlace:
    "只要设了规格，菜单上显示的就是规格价，而不是菜品价格。",
  traduireEn: (l) => `翻译成${l}`,
  traduireReste: (l, n) => `翻译成${l}（还剩 ${n}）`,
  aJour: (l) => `${l}已是最新`,
  traductionEnCours: "正在翻译…",
  dejaTraduit: (l) => `${l}已经全部翻译过了。`,
  platsTraduits: (n, l) => `${n} 道菜已翻译成${l}。`,
};

export const CARTE: Record<Langue, ClesCarte> = { fr, en, zh };
