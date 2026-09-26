import type { Traductions } from "@/lib/i18n/t";

/** La page « Réservation sur ton site » (le module à intégrer). */
export const INTEGRER: Traductions = {
  Encre: { en: "Ink", zh: "墨黑" },
  Marine: { en: "Navy", zh: "海军蓝" },
  Orange: { en: "Orange", zh: "橙色" },
  Bordeaux: { en: "Burgundy", zh: "酒红" },
  Vert: { en: "Green", zh: "绿色" },
  "Code copié ✓": { en: "Code copied ✓", zh: "代码已复制 ✓" },
  "Réservation sur ton site — {nom}": {
    en: "Booking on your website — {nom}",
    zh: "在您的网站上订位 — {nom}",
  },
  "Tu as déjà un site ? Colle ce code dedans : tes clients réservent sans le quitter, et la réservation arrive dans ton carnet Klarr, sans commission. Si tu n'as pas de site, ton {lien} fait déjà tout ça.":
    {
      en: "Already have a website? Paste this code into it: your customers book without leaving it, and the booking lands in your Klarr book, with no commission. If you don't have a website, your {lien} already does all this.",
      zh: "已经有网站了？把这段代码粘贴进去：顾客无需离开网站即可订位，订位会直接进入您的 Klarr 订位簿，不收佣金。如果您没有网站，您的{lien}已经包含这些功能。",
    },
  "site vitrine Klarr": { en: "Klarr website", zh: "Klarr 官网" },
  "Ouvre d'abord ta page de réservation : c'est elle que le module affiche.": {
    en: "Open your booking page first: it's what the module displays.",
    zh: "请先开通订位页面：模块显示的就是这个页面。",
  },
  "Configurer mes réservations": {
    en: "Set up my bookings",
    zh: "设置我的订位",
  },
  recommandé: { en: "recommended", zh: "推荐" },
  "1. Un bouton « Réserver »": {
    en: "1. A “Book” button",
    zh: "1. 「订位」按钮",
  },
  "Le bouton ouvre la réservation par-dessus ton site. Sur téléphone, elle prend tout l'écran.":
    {
      en: "The button opens the booking on top of your site. On a phone, it takes the whole screen.",
      zh: "按钮会在您的网站上方打开订位窗口。在手机上会全屏显示。",
    },
  Où: { en: "Where", zh: "位置" },
  "En bas à droite, partout": {
    en: "Bottom right, everywhere",
    zh: "右下角，所有页面",
  },
  "À l'endroit du code": { en: "Where the code is", zh: "代码所在位置" },
  Couleur: { en: "Colour", zh: "颜色" },
  "Texte du bouton": { en: "Button text", zh: "按钮文字" },
  "Réserver une table": { en: "Book a table", zh: "预订餐桌" },
  Appliquer: { en: "Apply", zh: "应用" },
  "Copier le code": { en: "Copy the code", zh: "复制代码" },
  "Réservations propulsées par {klarr}": {
    en: "Bookings powered by {klarr}",
    zh: "订位服务由 {klarr} 提供",
  },
  "La dernière ligne indique que les réservations passent par Klarr. Tu peux la retirer : le formulaire fonctionne sans.":
    {
      en: "The last line says bookings go through Klarr. You can remove it: the form works without it.",
      zh: "最后一行说明订位通过 Klarr 进行。您可以删掉它，表单照常工作。",
    },
  "Le texte suit la langue de ton site si tu ne le changes pas : « Book a table » sur une page en anglais. Tes propres boutons peuvent aussi ouvrir la réservation : ajoute-leur l'attribut {attribut}.":
    {
      en: "If you don't change it, the text follows your site's language: “Réserver une table” on a French page. Your own buttons can open the booking too: add the {attribut} attribute to them.",
      zh: "如果不修改，按钮文字会跟随网站语言：英文页面显示「Book a table」。您自己的按钮也可以打开订位：给它们加上 {attribut} 属性即可。",
    },
  Aperçu: { en: "Preview", zh: "预览" },
  "Aperçu du bouton sur un site": {
    en: "Preview of the button on a website",
    zh: "按钮在网站上的预览",
  },
  "Réserver chez {nom}": { en: "Book at {nom}", zh: "在 {nom} 订位" },
  "Votre site, tel qu'il est.": {
    en: "Your website, as it is.",
    zh: "您的网站，保持原样。",
  },
  "Le bouton de réservation s'ajoute {ou}. Cliquez dessus pour voir la fenêtre.":
    {
      en: "The booking button is added {ou}. Click it to see the window.",
      zh: "订位按钮会添加在{ou}。点击它即可查看订位窗口。",
    },
  "à l'endroit où le code est collé": {
    en: "where the code is pasted",
    zh: "粘贴代码的位置",
  },
  "en bas à droite, sur toutes les pages": {
    en: "at the bottom right, on every page",
    zh: "所有页面的右下角",
  },
  "2. La réservation dans une page": {
    en: "2. Booking inside a page",
    zh: "2. 嵌入页面的订位表单",
  },
  "Pour une page « Réserver » de ton site : le formulaire s'affiche directement dedans, sans bouton. C'est la solution pour Wix, dont le bloc HTML n'accepte pas le bouton flottant.":
    {
      en: "For a “Book” page on your site: the form shows directly inside it, with no button. It's the solution for Wix, whose HTML block doesn't accept the floating button.",
      zh: "适用于网站上的「订位」页面：表单直接显示在页面中，无需按钮。这是 Wix 的解决方案，因为 Wix 的 HTML 模块不支持浮动按钮。",
    },
  "3. Un simple lien": { en: "3. A simple link", zh: "3. 简单链接" },
  "Si ton outil de site n'accepte aucun code, mets ce lien sur n'importe quel bouton « Réserver ».":
    {
      en: "If your website tool doesn't accept any code, put this link on any “Book” button.",
      zh: "如果您的建站工具不接受任何代码，就把这个链接放在任意「订位」按钮上。",
    },
  "Où coller le code": { en: "Where to paste the code", zh: "代码粘贴位置" },
  "un bloc « HTML personnalisé » dans la page. Pour le bouton sur tout le site, dans le pied de page du thème ou une extension d'insertion de code.":
    {
      en: "a “Custom HTML” block in the page. For the button across the whole site, in the theme footer or a code-insertion plugin.",
      zh: "在页面中添加「自定义 HTML」区块。若要在全站显示按钮，请放在主题页脚或代码插入插件中。",
    },
  "« Ajouter » puis « Intégrer du code » et « Intégrer du HTML », avec le code n°2. Le bouton sur tout le site passe par le code personnalisé des paramètres, réservé aux sites Premium.":
    {
      en: "“Add”, then “Embed code” and “Embed HTML”, with code no. 2. The button across the whole site goes through the custom code in settings, reserved for Premium sites.",
      zh: "点击「添加」→「嵌入代码」→「嵌入 HTML」，使用第 2 段代码。若要全站显示按钮，需在设置的自定义代码中添加，仅限 Premium 网站。",
    },
  "un bloc « Code » dans la page, ou l'injection de code des paramètres avancés pour tout le site.":
    {
      en: "a “Code” block in the page, or code injection in advanced settings for the whole site.",
      zh: "在页面中添加「代码」区块，或在高级设置中使用代码注入实现全站显示。",
    },
  "un élément « Embed », ou le code personnalisé du projet.": {
    en: "an “Embed” element, or the project's custom code.",
    zh: "添加「Embed」元素，或使用项目的自定义代码。",
  },
  "Un site fait par une agence": {
    en: "A site built by an agency",
    zh: "由代理公司制作的网站",
  },
  "envoie-lui le code n°1, c'est une ligne à ajouter.": {
    en: "send them code no. 1, it's one line to add.",
    zh: "把第 1 段代码发给他们，只需添加一行。",
  },
  "Les noms des menus changent parfois d'une version à l'autre de ces outils.":
    {
      en: "Menu names sometimes change from one version of these tools to the next.",
      zh: "这些工具的菜单名称可能会随版本更新而变化。",
    },
};
