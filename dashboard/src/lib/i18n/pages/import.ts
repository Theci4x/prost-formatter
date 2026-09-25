import type { Traductions } from "@/lib/i18n/t";

/** La page Importer (fichier client, réservations à venir). */
export const IMPORT: Traductions = {
  "Importer — {nom}": { en: "Import — {nom}", zh: "导入 — {nom}" },
  "Tu viens de TheFork, de Zenchef ou d'un tableur ? Reprends ton fichier client et tes réservations à venir en quelques minutes : exporte-les de l'ancien outil, dépose le fichier ici, vérifie, importe. Rien n'est écrasé, et aucun client n'est prévenu.":
    {
      en: "Coming from TheFork, Zenchef or a spreadsheet? Bring over your customer list and upcoming bookings in a few minutes: export them from the old tool, drop the file here, check, import. Nothing is overwritten, and no customer is notified.",
      zh: "从 TheFork、Zenchef 或表格迁移过来？几分钟就能导入顾客档案和即将到来的订位：从旧工具导出，把文件拖到这里，检查后导入。不会覆盖任何数据，也不会通知任何顾客。",
    },
  "clients déjà au fichier": {
    en: "customers already on file",
    zh: "位顾客已在档案中",
  },
  "réservations à venir au carnet": {
    en: "upcoming bookings in the book",
    zh: "笔即将到来的订位",
  },

  // Où exporter
  "Connecte-toi à TheFork Manager et ouvre ta liste de clients.": {
    en: "Sign in to TheFork Manager and open your customer list.",
    zh: "登录 TheFork Manager，打开顾客列表。",
  },
  "Cherche l'option d'export et choisis le format CSV (ou Excel, que tu enregistreras en CSV).":
    {
      en: "Look for the export option and choose CSV (or Excel, which you'll save as CSV).",
      zh: "找到导出选项，选择 CSV 格式（或 Excel，之后另存为 CSV）。",
    },
  "Si tu ne trouves pas l'export, demande-le au support TheFork : c'est ton fichier.":
    {
      en: "If you can't find the export, ask TheFork support for it: it's your data.",
      zh: "如果找不到导出功能，请向 TheFork 客服索取：这是您的数据。",
    },
  "Dans TheFork Manager, ouvre la liste des réservations.": {
    en: "In TheFork Manager, open the bookings list.",
    zh: "在 TheFork Manager 中打开订位列表。",
  },
  "Choisis la période à venir — par exemple les trois prochains mois — puis exporte en CSV.":
    {
      en: "Choose the upcoming period — for example the next three months — then export as CSV.",
      zh: "选择未来的时间段——例如未来三个月——然后导出为 CSV。",
    },
  "Garde TheFork ouvert jusqu'au jour de la bascule : les nouvelles réservations y arrivent encore.":
    {
      en: "Keep TheFork open until switch-over day: new bookings still arrive there.",
      zh: "在正式切换之前请保留 TheFork：新的订位仍会进入那里。",
    },
  "Connecte-toi à Zenchef et ouvre la base clients.": {
    en: "Sign in to Zenchef and open the customer database.",
    zh: "登录 Zenchef，打开顾客数据库。",
  },
  "Si tu ne trouves pas l'export, demande-le au support Zenchef : c'est ton fichier.":
    {
      en: "If you can't find the export, ask Zenchef support for it: it's your data.",
      zh: "如果找不到导出功能，请向 Zenchef 客服索取：这是您的数据。",
    },
  "Dans Zenchef, ouvre la liste des réservations.": {
    en: "In Zenchef, open the bookings list.",
    zh: "在 Zenchef 中打开订位列表。",
  },
  "Choisis la période à venir, puis exporte en CSV.": {
    en: "Choose the upcoming period, then export as CSV.",
    zh: "选择未来的时间段，然后导出为 CSV。",
  },
  "Garde Zenchef ouvert jusqu'au jour de la bascule : les nouvelles réservations y arrivent encore.":
    {
      en: "Keep Zenchef open until switch-over day: new bookings still arrive there.",
      zh: "在正式切换之前请保留 Zenchef：新的订位仍会进入那里。",
    },
  "Ouvre ton fichier dans Excel, Numbers ou Google Sheets.": {
    en: "Open your file in Excel, Numbers or Google Sheets.",
    zh: "用 Excel、Numbers 或 Google 表格打开文件。",
  },
  "Une ligne par client, avec au moins une colonne e-mail.": {
    en: "One row per customer, with at least an email column.",
    zh: "每位顾客一行，至少要有邮箱这一列。",
  },
  "Enregistre-le au format CSV (Fichier → Enregistrer sous, ou Télécharger → CSV).":
    {
      en: "Save it as CSV (File → Save as, or Download → CSV).",
      zh: "另存为 CSV 格式（文件 → 另存为，或 下载 → CSV）。",
    },
  "Ouvre ton tableau dans Excel, Numbers ou Google Sheets.": {
    en: "Open your spreadsheet in Excel, Numbers or Google Sheets.",
    zh: "用 Excel、Numbers 或 Google 表格打开表格。",
  },
  "Une ligne par réservation : date, heure, nombre de couverts et nom au minimum.":
    {
      en: "One row per booking: at least date, time, number of guests and name.",
      zh: "每笔订位一行：至少包括日期、时间、人数和姓名。",
    },
  "Un tableur": { en: "A spreadsheet", zh: "表格" },

  // L'assistant
  "C'est un fichier Excel ou Numbers : enregistre-le d'abord au format CSV, puis dépose ce CSV ici.":
    {
      en: "This is an Excel or Numbers file: save it as CSV first, then drop that CSV here.",
      zh: "这是 Excel 或 Numbers 文件：请先另存为 CSV，再把 CSV 文件拖到这里。",
    },
  "Le fichier semble vide : il faut une ligne d'en-têtes et au moins une ligne de données.":
    {
      en: "The file looks empty: it needs a header row and at least one data row.",
      zh: "文件似乎是空的：需要一行表头和至少一行数据。",
    },
  "1. Ce que tu importes": {
    en: "1. What you're importing",
    zh: "1. 导入内容",
  },
  "Mon fichier client": { en: "My customer list", zh: "我的顾客档案" },
  "Mes réservations à venir": {
    en: "My upcoming bookings",
    zh: "我即将到来的订位",
  },
  "Depuis :": { en: "From:", zh: "来源：" },
  "Crée d'abord au moins une salle dans {lien} : chaque réservation importée doit y être rangée.":
    {
      en: "First create at least one room in {lien}: every imported booking needs to be placed in one.",
      zh: "请先在{lien}中创建至少一个场地：每笔导入的订位都需要归入某个场地。",
    },
  "la configuration des réservations": {
    en: "the booking settings",
    zh: "订位设置",
  },
  "2. Ton fichier": { en: "2. Your file", zh: "2. 您的文件" },
  "Choisis ou dépose ton fichier CSV": {
    en: "Choose or drop your CSV file",
    zh: "选择或拖放 CSV 文件",
  },
  "{n} ligne lue — clique pour en choisir un autre": {
    en: "{n} row read — click to choose another",
    zh: "已读取 {n} 行——点击选择其他文件",
  },
  "{n} lignes lues — clique pour en choisir un autre": {
    en: "{n} rows read — click to choose another",
    zh: "已读取 {n} 行——点击选择其他文件",
  },
  "Il reste sur ton ordinateur tant que tu n'as pas cliqué « Importer ».": {
    en: "It stays on your computer until you click “Import”.",
    zh: "点击「导入」之前，文件只保存在您的电脑上。",
  },
  "3. Vérifie les colonnes": { en: "3. Check the columns", zh: "3. 检查各列" },
  "Klarr a reconnu ce qu'il a pu. Corrige ce qui ne va pas : l'aperçu se met à jour.":
    {
      en: "Klarr recognised what it could. Fix anything that's wrong: the preview updates.",
      zh: "Klarr 已尽量识别各列。如有错误请更正：预览会随之更新。",
    },
  "E-mail": { en: "Email", zh: "邮箱" },
  Prénom: { en: "First name", zh: "名" },
  Nom: { en: "Name", zh: "姓名" },
  Téléphone: { en: "Phone", zh: "电话" },
  Date: { en: "Date", zh: "日期" },
  Heure: { en: "Time", zh: "时间" },
  Couverts: { en: "Guests", zh: "人数" },
  Commentaire: { en: "Comment", zh: "备注" },
  "Accepte les actualités (opt-in)": {
    en: "Accepts news (opt-in)",
    zh: "接受营销信息（opt-in）",
  },
  Statut: { en: "Status", zh: "状态" },
  "Opt-in": { en: "Opt-in", zh: "Opt-in" },
  oui: { en: "yes", zh: "是" },
  "— Aucune colonne —": { en: "— No column —", zh: "— 无 —" },
  "Colonne {n}": { en: "Column {n}", zh: "第 {n} 列" },
  "Il manque : {liste}. Choisis la colonne correspondante ci-dessus.": {
    en: "Missing: {liste}. Choose the matching column above.",
    zh: "缺少：{liste}。请在上方选择对应的列。",
  },
  "clients prêts à importer": {
    en: "customers ready to import",
    zh: "位顾客可导入",
  },
  "réservations à venir prêtes à importer": {
    en: "upcoming bookings ready to import",
    zh: "笔订位可导入",
  },
  "lignes laissées de côté": { en: "rows set aside", zh: "行被跳过" },
  "… et {n} autres": { en: "… and {n} more", zh: "……还有 {n} 条" },
  "Pourquoi {n} ligne est laissée de côté": {
    en: "Why {n} row is set aside",
    zh: "为什么跳过了 {n} 行",
  },
  "Pourquoi {n} lignes sont laissées de côté": {
    en: "Why {n} rows are set aside",
    zh: "为什么跳过了 {n} 行",
  },
  "Ligne {n} : {raison}": {
    en: "Row {n}: {raison}",
    zh: "第 {n} 行：{raison}",
  },
  "pas d'e-mail valide": { en: "no valid email", zh: "没有有效邮箱" },
  "e-mail en double dans le fichier": {
    en: "duplicate email in the file",
    zh: "文件中邮箱重复",
  },
  "annulée ou non venue": { en: "cancelled or no-show", zh: "已取消或未到店" },
  "date illisible": { en: "unreadable date", zh: "日期无法识别" },
  "date passée": { en: "date in the past", zh: "日期已过" },
  "heure illisible": { en: "unreadable time", zh: "时间无法识别" },
  "nombre de couverts manquant": {
    en: "number of guests missing",
    zh: "缺少人数",
  },
  "nom manquant": { en: "name missing", zh: "缺少姓名" },
  "Je certifie que les {n} clients marqués « oui » dans la colonne « {colonne} » ont accepté de recevoir les actualités de mon restaurant. Sans cette case, ils sont importés sans consentement : ils n'apparaîtront pas dans les destinataires de tes campagnes.":
    {
      en: "I certify that the {n} customers marked “yes” in the “{colonne}” column agreed to receive news from my restaurant. Without this box, they're imported without consent: they won't appear among your campaign recipients.",
      zh: "我确认「{colonne}」列中标记为「是」的 {n} 位顾客已同意接收本餐厅的营销信息。如不勾选，这些顾客将以未同意状态导入：不会出现在您的营销活动收件人中。",
    },
  "Aucune colonne d'opt-in : les clients sont importés sans consentement, et ne recevront pas tes campagnes tant qu'ils ne l'auront pas donné en réservant.":
    {
      en: "No opt-in column: customers are imported without consent, and won't receive your campaigns until they give it when booking.",
      zh: "没有 opt-in 列：顾客将以未同意状态导入，在订位时表示同意之前，不会收到您的营销活动。",
    },
  "Les réservations importées arrivent confirmées dans ton carnet. Klarr n'envoie rien à ces clients : ils ont déjà reçu leur confirmation de l'autre outil.":
    {
      en: "Imported bookings arrive confirmed in your book. Klarr sends nothing to these customers: they already got their confirmation from the other tool.",
      zh: "导入的订位会以已确认状态进入您的订位簿。Klarr 不会给这些顾客发送任何消息：他们已从原工具收到过确认。",
    },
  "Import en cours…": { en: "Importing…", zh: "正在导入…" },
  "Importer {n} client": { en: "Import {n} customer", zh: "导入 {n} 位顾客" },
  "Importer {n} clients": { en: "Import {n} customers", zh: "导入 {n} 位顾客" },
  "Importer {n} réservation": {
    en: "Import {n} booking",
    zh: "导入 {n} 笔订位",
  },
  "Importer {n} réservations": {
    en: "Import {n} bookings",
    zh: "导入 {n} 笔订位",
  },
  Recommencer: { en: "Start over", zh: "重新开始" },
  "L'import s'est interrompu": {
    en: "The import stopped",
    zh: "导入已中断",
  },
  "Import terminé": { en: "Import complete", zh: "导入完成" },
  "{n} client ajouté": { en: "{n} customer added", zh: "已添加 {n} 位顾客" },
  "{n} clients ajoutés": { en: "{n} customers added", zh: "已添加 {n} 位顾客" },
  "{n} réservation ajoutée": {
    en: "{n} booking added",
    zh: "已添加 {n} 笔订位",
  },
  "{n} réservations ajoutées": {
    en: "{n} bookings added",
    zh: "已添加 {n} 笔订位",
  },
  ", {n} déjà présent": { en: ", {n} already there", zh: "，{n} 条已存在" },
  ", {n} déjà présents": { en: ", {n} already there", zh: "，{n} 条已存在" },
  ", {n} déjà présente": { en: ", {n} already there", zh: "，{n} 条已存在" },
  ", {n} déjà présentes": { en: ", {n} already there", zh: "，{n} 条已存在" },
  ", {n} refusé": { en: ", {n} rejected", zh: "，{n} 条被拒绝" },
  ", {n} refusés": { en: ", {n} rejected", zh: "，{n} 条被拒绝" },
  ", {n} refusée": { en: ", {n} rejected", zh: "，{n} 条被拒绝" },
  ", {n} refusées": { en: ", {n} rejected", zh: "，{n} 条被拒绝" },
  ". {n} pourront recevoir tes campagnes.": {
    en: ". {n} will be able to receive your campaigns.",
    zh: "。其中 {n} 位可以接收您的营销活动。",
  },
  "Voir mon fichier client →": {
    en: "See my customer list →",
    zh: "查看我的顾客档案 →",
  },
  "Voir mon carnet →": { en: "See my booking book →", zh: "查看我的订位簿 →" },

  // Les messages de l'import côté serveur
  "Aucun client à importer.": {
    en: "No customers to import.",
    zh: "没有可导入的顾客。",
  },
  "Plus de {n} clients : découpe le fichier en plusieurs parties.": {
    en: "More than {n} customers: split the file into several parts.",
    zh: "超过 {n} 位顾客：请把文件拆分成几部分。",
  },
  "L'import s'est arrêté après {n} clients. Réessaie : ceux déjà ajoutés ne seront pas dédoublés.":
    {
      en: "The import stopped after {n} customers. Try again: those already added won't be duplicated.",
      zh: "导入在添加 {n} 位顾客后中断。请重试：已添加的顾客不会重复。",
    },
  "Aucune réservation à importer.": {
    en: "No bookings to import.",
    zh: "没有可导入的订位。",
  },
  "Plus de {n} réservations : découpe le fichier en plusieurs parties.": {
    en: "More than {n} bookings: split the file into several parts.",
    zh: "超过 {n} 笔订位：请把文件拆分成几部分。",
  },
  "Crée d'abord au moins une salle dans « Configuration » : chaque réservation doit y être rangée.":
    {
      en: "First create at least one room in “Settings”: every booking needs to be placed in one.",
      zh: "请先在「设置」中创建至少一个场地：每笔订位都需要归入某个场地。",
    },
  "L'import s'est arrêté après {n} réservations. Réessaie : celles déjà ajoutées ne seront pas dédoublées.":
    {
      en: "The import stopped after {n} bookings. Try again: those already added won't be duplicated.",
      zh: "导入在添加 {n} 笔订位后中断。请重试：已添加的订位不会重复。",
    },
};
