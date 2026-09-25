import type { Traductions } from "@/lib/i18n/t";

/** La page Photos, l'ajout et la légende d'une photo. */
export const PHOTOS: Traductions = {
  "Photos — {nom}": { en: "Photos — {nom}", zh: "照片 — {nom}" },
  "Tes photos illustrent ton site vitrine et ta page de réservation. Une légende dit ce qu'on voit — « la terrasse l'été », « le tartare » : elle aide tes clients, et Google comprend mieux ce que montre l'image.":
    {
      en: "Your photos illustrate your website and your booking page. A caption says what's in it — “the terrace in summer”, “the tartare”: it helps your customers, and Google better understands what the image shows.",
      zh: "您的照片会展示在官网和订位页面上。图片说明描述照片内容——例如「夏天的露台」「鞑靼牛肉」：既能帮助顾客，也能让 Google 更好地理解图片。",
    },
  "Toutes · {n}": { en: "All · {n}", zh: "全部 · {n}" },
  "Sans légende · {n}": { en: "No caption · {n}", zh: "无说明 · {n}" },
  photo: { en: "photo", zh: "张照片" },
  photos: { en: "photos", zh: "张照片" },
  "avec légende": { en: "with a caption", zh: "张有说明" },
  "sans légende": { en: "without a caption", zh: "张无说明" },
  "photo de salle, montrée à la réservation": {
    en: "room photo, shown when booking",
    zh: "张场地照片，在订位时展示",
  },
  "photos de salle, montrées à la réservation": {
    en: "room photos, shown when booking",
    zh: "张场地照片，在订位时展示",
  },
  "Photo de couverture": { en: "Cover photo", zh: "封面照片" },
  "Choisie par toi.": { en: "Chosen by you.", zh: "由您选择。" },
  "La première de tes photos, faute de choix.": {
    en: "Your first photo, since none was chosen.",
    zh: "未选择封面，暂用您的第一张照片。",
  },
  "Aucune pour l'instant.": { en: "None yet.", zh: "暂时没有。" },
  "Elle ouvre ton site, en plein écran, avant qu'on lise quoi que ce soit : choisis la salle pleine ou la façade plutôt que le plat isolé. Pour en changer, « Mettre en couverture » sous n'importe quelle photo.":
    {
      en: "It opens your website, full screen, before anything is read: choose a full dining room or the front rather than a single dish. To change it, use “Set as cover” under any photo.",
      zh: "它会全屏出现在官网最前面，先于任何文字：请选择满座的餐厅或门面，而不是单独一道菜。要更换封面，点击任意照片下方的「设为封面」。",
    },
  "Ajouter une photo": { en: "Add a photo", zh: "添加照片" },
  "Toutes tes photos": { en: "All your photos", zh: "您的所有照片" },
  "Aucune photo pour le moment. La première que tu ajoutes ouvrira ton site.": {
    en: "No photos yet. The first one you add will open your website.",
    zh: "暂时没有照片。您添加的第一张将作为官网的开场图。",
  },
  Couverture: { en: "Cover", zh: "封面" },
  "Ajouter une légende…": { en: "Add a caption…", zh: "添加说明…" },
  "Ouvre ton site": { en: "Opens your website", zh: "官网开场图" },
  "Mettre en couverture": { en: "Set as cover", zh: "设为封面" },
  "Supprimer la photo": { en: "Delete the photo", zh: "删除照片" },

  // L'ajout
  "Choisis une photo.": { en: "Choose a photo.", zh: "请选择一张照片。" },
  "Ce fichier ne s'ouvre pas comme une image.": {
    en: "This file doesn't open as an image.",
    zh: "此文件无法作为图片打开。",
  },
  "Ce fichier n'est pas une image.": {
    en: "This file isn't an image.",
    zh: "此文件不是图片。",
  },
  "Photo trop lourde (4 Mo maximum). Réduis-la avant de l'envoyer.": {
    en: "Photo too large (4 MB maximum). Shrink it before uploading.",
    zh: "照片太大（最大 4 MB）。请先压缩再上传。",
  },
  "L'envoi a échoué. Réessaie.": {
    en: "The upload failed. Try again.",
    zh: "上传失败，请重试。",
  },
  "La photo n'a pas été enregistrée.": {
    en: "The photo wasn't saved.",
    zh: "照片未保存。",
  },
  "Réduite à {l} × {h} px ({poids}).": {
    en: "Resized to {l} × {h} px ({poids}).",
    zh: "已缩小为 {l} × {h} 像素（{poids}）。",
  },
  "Choisir une photo, ou la déposer ici": {
    en: "Choose a photo, or drop it here",
    zh: "选择照片，或拖放到这里",
  },
  "Ajoute une légende si tu veux, puis « Ajouter la photo ».": {
    en: "Add a caption if you like, then “Add the photo”.",
    zh: "如有需要可添加说明，然后点击「添加照片」。",
  },
  "Une photo de téléphone est réduite toute seule avant l'envoi.": {
    en: "A phone photo is resized automatically before uploading.",
    zh: "手机照片会在上传前自动缩小。",
  },
  "Légende de la photo": { en: "Photo caption", zh: "照片说明" },
  "Légende (facultatif) — « La terrasse, l'été »": {
    en: "Caption (optional) — “The terrace, in summer”",
    zh: "说明（选填）——「夏天的露台」",
  },
  "Envoi…": { en: "Uploading…", zh: "正在上传…" },
  "Ajouter la photo": { en: "Add the photo", zh: "添加照片" },

  // La légende
  "Légende de cette photo": { en: "This photo's caption", zh: "此照片的说明" },
  "Salle speakeasy, au sous-sol": {
    en: "Speakeasy room, downstairs",
    zh: "地下室的隐秘酒吧",
  },
  Enregistré: { en: "Saved", zh: "已保存" },
};
