import type { Traductions } from "@/lib/i18n/t";

/**
 * Les pages de la Roue de la fortune côté restaurateur. Le carton à
 * imprimer reste en français : il est posé sur une table française.
 */
export const ROUE: Traductions = {
  "Roue de la fortune — {nom}": {
    en: "Wheel of fortune — {nom}",
    zh: "幸运转盘 — {nom}",
  },
  "Un panneau sur la table, avec son propre QR code : le client scanne, tourne la roue, et son lot part par e-mail pour la visite suivante — c'est une raison de revenir autant qu'un cadeau. Le totem des avis reste à part, il ne change pas.":
    {
      en: "A card on the table, with its own QR code: the customer scans, spins the wheel, and their prize is emailed for their next visit — a reason to come back as much as a gift. The review stand stays separate and doesn't change.",
      zh: "餐桌上放一张带专属二维码的卡片：顾客扫码、转动转盘，奖品会通过邮件发送，下次到店时使用——既是礼物，也是再来的理由。评价立牌保持独立，不受影响。",
    },
  "Retirer un lot": { en: "Redeem a prize", zh: "兑换奖品" },
  Allumée: { en: "On", zh: "已开启" },
  Éteinte: { en: "Off", zh: "已关闭" },
  "la roue tourne en salle": {
    en: "the wheel is spinning in the dining room",
    zh: "转盘正在店内运行",
  },
  "rien ne change pour tes clients": {
    en: "nothing changes for your customers",
    zh: "对顾客没有任何变化",
  },
  "partie jouée": { en: "game played", zh: "局已玩" },
  "parties jouées": { en: "games played", zh: "局已玩" },
  "lot gagné": { en: "prize won", zh: "个奖品被赢得" },
  "lots gagnés": { en: "prizes won", zh: "个奖品被赢得" },
  "retiré en salle": { en: "redeemed in the restaurant", zh: "个已在店内兑换" },
  "retirés en salle": {
    en: "redeemed in the restaurant",
    zh: "个已在店内兑换",
  },
  "À lire avant d'allumer": {
    en: "Read before turning on",
    zh: "开启前请阅读",
  },
  "Google interdit d'offrir quoi que ce soit en échange d'un avis, quelle que soit la note. En cas de détection, les avis concernés sont supprimés — y compris ceux que tu as obtenus autrement — et la fiche peut être suspendue. Klarr ne trie jamais sur la note et ne prétend pas vérifier qu'un avis a été écrit : personne ne le peut techniquement. La roue tourne pour tout le monde, une étoile comme cinq.":
    {
      en: "Google forbids offering anything in exchange for a review, whatever the rating. If detected, the reviews concerned are removed — including those you got otherwise — and the listing can be suspended. Klarr never filters by rating and doesn't claim to check that a review was written: nobody technically can. The wheel spins for everyone, one star or five.",
      zh: "Google 禁止以任何形式换取评价，无论评分高低。一旦被发现，相关评价会被删除——包括通过其他途径获得的评价——商家资料也可能被暂停。Klarr 从不按评分筛选，也不声称能验证顾客是否写了评价：技术上没人能做到。转盘对所有人开放，一星和五星都一样。",
    },
  "Les cases": { en: "The segments", zh: "转盘格子" },
  "Ce que la roue peut donner, et à quelle fréquence. Deux cases minimum, dont une gagnante.":
    {
      en: "What the wheel can give, and how often. At least two segments, including one winning.",
      zh: "转盘可以给出什么、以及出现的频率。至少两格，其中一格有奖。",
    },
  Gagnante: { en: "Winning", zh: "有奖" },
  Perdante: { en: "Losing", zh: "无奖" },
  "Stock épuisé": { en: "Out of stock", zh: "已抽完" },
  "Retirée du tirage": { en: "Out of the draw", zh: "已移出抽奖" },
  "{part} % des parties": { en: "{part}% of games", zh: "{part}% 的局数" },
  "{n} sur {stock} distribué": {
    en: "{n} of {stock} given out",
    zh: "已送出 {n}/{stock}",
  },
  "{n} sur {stock} distribués": {
    en: "{n} of {stock} given out",
    zh: "已送出 {n}/{stock}",
  },
  "Ajouter une case": { en: "Add a segment", zh: "添加格子" },
  Fermer: { en: "Close", zh: "关闭" },
  "Douze cases, c'est le maximum : au-delà, la roue devient illisible sur un téléphone.":
    {
      en: "Twelve segments is the maximum: beyond that, the wheel becomes unreadable on a phone.",
      zh: "最多十二格：再多的话，在手机上就看不清了。",
    },
  "Mise en service": { en: "Going live", zh: "启用" },
  "Le seul réglage que tes clients voient. Tant qu'il est éteint, le totem se comporte comme aujourd'hui.":
    {
      en: "The only setting your customers see. While it's off, the stand behaves as it does today.",
      zh: "这是顾客唯一能看到的设置。关闭时，评价立牌保持现状。",
    },
  "La roue tourne": { en: "The wheel is on", zh: "转盘运行中" },
  "L'adresse à mettre sur le panneau du jeu. Ce n'est pas celle du totem des avis.":
    {
      en: "The address to put on the game card. It's not the review stand's.",
      zh: "放在游戏卡片上的网址。与评价立牌的网址不同。",
    },
  "Le panneau à imprimer, avec les avis": {
    en: "The printable card, with reviews",
    zh: "可打印的卡片（含评价）",
  },
  "Éteindre la roue": { en: "Turn the wheel off", zh: "关闭转盘" },
  "Tes cases sont prêtes. En allumant, la roue apparaît sur la page du totem.":
    {
      en: "Your segments are ready. When you turn it on, the wheel appears on the stand's page.",
      zh: "格子已设置好。开启后，转盘会出现在立牌页面上。",
    },
  "Allumer la roue": { en: "Turn the wheel on", zh: "开启转盘" },
  "Il faut au moins deux cases, dont une gagnante, pour que la roue ait un sens. Ajoute-les dans « Les cases ».":
    {
      en: "You need at least two segments, including a winning one, for the wheel to make sense. Add them in “The segments”.",
      zh: "至少需要两格（其中一格有奖），转盘才有意义。请在「转盘格子」中添加。",
    },
  "{n} partie jouée": { en: "{n} game played", zh: "已玩 {n} 局" },
  "{n} parties jouées": { en: "{n} games played", zh: "已玩 {n} 局" },
  ", {n} lot retiré en salle.": {
    en: ", {n} prize redeemed in the restaurant.",
    zh: "，店内已兑换 {n} 个奖品。",
  },
  ", {n} lots retirés en salle.": {
    en: ", {n} prizes redeemed in the restaurant.",
    zh: "，店内已兑换 {n} 个奖品。",
  },
  "Les réglages": { en: "Settings", zh: "设置" },
  "Ce que le client lit, et combien de temps son lot vaut.": {
    en: "What the customer reads, and how long their prize is valid.",
    zh: "顾客看到的文字，以及奖品的有效期。",
  },

  // Une case
  "Case gagnante": { en: "Winning segment", zh: "有奖格子" },
  "— décoche pour une case qui ne donne rien. Le client voit « Perdu », et c'est ce qui rend les autres cases désirables.":
    {
      en: "— untick for a segment that gives nothing. The customer sees “Lost”, and that's what makes the other segments desirable.",
      zh: "——取消勾选即为无奖格子。顾客会看到「未中奖」，这正是让其他格子更有吸引力的原因。",
    },
  "Le lot, tel que le client le lit": {
    en: "The prize, as the customer reads it",
    zh: "奖品名称（顾客看到的文字）",
  },
  "Ce que le client lit": {
    en: "What the customer reads",
    zh: "顾客看到的文字",
  },
  "Un café offert": { en: "A free coffee", zh: "免费咖啡一杯" },
  "Perdu — retentez demain": {
    en: "Lost — try again tomorrow",
    zh: "未中奖——明天再试",
  },
  Fréquence: { en: "Frequency", zh: "出现频率" },
  "Un poids, pas un pourcentage : une case à 70 sort sept fois plus souvent qu'une case à 10. Mets 0 pour retirer la case du tirage sans la supprimer.":
    {
      en: "A weight, not a percentage: a segment at 70 comes up seven times more often than one at 10. Set 0 to take the segment out of the draw without deleting it.",
      zh: "这是权重，不是百分比：权重 70 的格子出现次数是权重 10 的七倍。设为 0 可将格子移出抽奖而不删除。",
    },
  "Précision pour la salle": { en: "Note for the staff", zh: "给店员的说明" },
  "(facultatif)": { en: "(optional)", zh: "（选填）" },
  "Expresso ou allongé, pas un dessert": {
    en: "Espresso or americano, not a dessert",
    zh: "意式浓缩或美式咖啡，不含甜点",
  },
  "Jamais montrée au client. C'est ce que lit le serveur quand on lui présente le code.":
    {
      en: "Never shown to the customer. It's what the server reads when shown the code.",
      zh: "不会显示给顾客。店员核对兑换码时会看到这段说明。",
    },
  Stock: { en: "Stock", zh: "库存" },
  illimité: { en: "unlimited", zh: "不限" },
  "Combien tu acceptes d'en offrir en tout. Une fois atteint, la case ne sort plus et les autres se repartagent le tirage.":
    {
      en: "How many you're willing to give away in total. Once reached, the segment stops coming up and the others share the draw.",
      zh: "总共愿意送出的数量。达到后，该格子不再出现，其他格子重新分配概率。",
    },
  "Ajouter cette case": { en: "Add this segment", zh: "添加此格子" },

  // Les réglages
  "Titre affiché au client": {
    en: "Title shown to the customer",
    zh: "显示给顾客的标题",
  },
  "Sous-titre": { en: "Subtitle", zh: "副标题" },
  "Un lot à retirer lors de votre prochaine visite": {
    en: "A prize to collect on your next visit",
    zh: "下次到店时可兑换奖品",
  },
  "Validité du lot (jours)": {
    en: "Prize validity (days)",
    zh: "奖品有效期（天）",
  },
  "Le lot part par e-mail et se présente à la visite suivante. Trop court, personne ne revient à temps ; trop long, tu oublies ce que tu dois.":
    {
      en: "The prize is emailed and redeemed on the next visit. Too short, and nobody comes back in time; too long, and you forget what you owe.",
      zh: "奖品通过邮件发送，下次到店时兑换。太短的话没人来得及回来；太长的话您会忘记欠了什么。",
    },
  "Avant de rejouer (jours)": {
    en: "Before playing again (days)",
    zh: "再次参与间隔（天）",
  },
  "Une même adresse ne rejoue pas avant ce délai — sans quoi une table vide ton stock depuis son téléphone. Mets 0 pour une soirée particulière, jamais pour un totem posé à l'année.":
    {
      en: "The same address can't play again before this delay — otherwise one table empties your stock from its phone. Set 0 for a special evening, never for a stand left out all year.",
      zh: "同一邮箱在此期间内不能再次参与——否则一桌客人就能用手机把奖品抽光。特别活动时可设为 0，常年摆放的立牌切勿设为 0。",
    },

  // Le panneau
  "Panneau à imprimer": { en: "Printable card", zh: "可打印卡片" },
  "Ouvre d'abord ta page de réservation : c'est son adresse qui sert au jeu comme aux avis.":
    {
      en: "Open your booking page first: its address is used for the game and the reviews.",
      zh: "请先开通订位页面：游戏和评价都使用它的网址。",
    },
  "Réglages des réservations": { en: "Booking settings", zh: "订位设置" },
  "← Roue de la fortune": { en: "← Wheel of fortune", zh: "← 幸运转盘" },
  "Imprime en A5, ou en A4 puis plie en deux. Vérifie les deux QR avec ton propre téléphone avant d'en faire cinquante : un carton imprimé de travers se paie en papier.":
    {
      en: "Print on A5, or on A4 then fold in half. Check both QR codes with your own phone before printing fifty: a misprinted card costs paper. The card stays in French, for your customers.",
      zh: "用 A5 纸打印，或用 A4 纸打印后对折。在印五十张之前，先用自己的手机扫一下两个二维码：印错了就浪费纸。卡片内容保持法语，面向您的顾客。",
    },
  "Imprimer le panneau": { en: "Print the card", zh: "打印卡片" },

  // Le retrait
  "Le client montre son code": {
    en: "The customer shows their code",
    zh: "顾客出示兑换码",
  },
  "Dans son e-mail, ou sur son écran.": {
    en: "In their email, or on their screen.",
    zh: "在邮件中或手机屏幕上。",
  },
  "Tu vérifies le lot": { en: "You check the prize", zh: "核对奖品" },
  "Ce qu'il a gagné et jusqu'à quand il vaut.": {
    en: "What they won and how long it's valid.",
    zh: "赢得了什么，以及有效期到哪天。",
  },
  "Tu confirmes la remise": {
    en: "You confirm it's been given",
    zh: "确认已兑换",
  },
  "Une fois le lot donné — le code ne resservira pas.": {
    en: "Once the prize is given — the code can't be used again.",
    zh: "奖品交付后确认——兑换码不能再次使用。",
  },
  "Lot remis": { en: "Prize given", zh: "奖品已兑换" },
  "Code suivant": { en: "Next code", zh: "下一个兑换码" },
  "Cette partie n'a rien gagné. Il n'y a rien à remettre.": {
    en: "This game didn't win anything. There's nothing to give.",
    zh: "这一局没有中奖，无需兑换。",
  },
  "Déjà retiré le {date}.": {
    en: "Already redeemed on {date}.",
    zh: "已于 {date} 兑换。",
  },
  "Périmé depuis le {date}.": {
    en: "Expired since {date}.",
    zh: "已于 {date} 过期。",
  },
  "Valable jusqu'au {date}.": {
    en: "Valid until {date}.",
    zh: "有效期至 {date}。",
  },
  "Je l'ai remis": { en: "I've given it", zh: "我已交付" },
  "Chercher un autre code": {
    en: "Look up another code",
    zh: "查找其他兑换码",
  },
  "Le code du client": { en: "The customer's code", zh: "顾客的兑换码" },
  "Recherche…": { en: "Searching…", zh: "正在查找…" },
  Chercher: { en: "Search", zh: "查找" },

  // Les messages des actions
  "Donne un nom à cette case — c'est ce que le client lira.": {
    en: "Give this segment a name — it's what the customer will read.",
    zh: "请为此格子命名——顾客会看到这个名字。",
  },
  "Ce nom est trop long : 80 caractères au maximum.": {
    en: "This name is too long: 80 characters maximum.",
    zh: "名称太长：最多 80 个字符。",
  },
  "La fréquence doit être un nombre entier, 0 ou plus.": {
    en: "The frequency must be a whole number, 0 or more.",
    zh: "频率必须是 0 或以上的整数。",
  },
  "La fréquence est plafonnée à 1000.": {
    en: "The frequency is capped at 1000.",
    zh: "频率上限为 1000。",
  },
  "Le stock doit être un nombre entier, ou vide pour illimité.": {
    en: "The stock must be a whole number, or empty for unlimited.",
    zh: "库存必须是整数，留空表示不限。",
  },
  "Établissement introuvable.": {
    en: "Restaurant not found.",
    zh: "找不到该餐厅。",
  },
  "L'enregistrement a échoué. Réessaie.": {
    en: "Saving failed. Try again.",
    zh: "保存失败，请重试。",
  },
  "Case introuvable.": { en: "Segment not found.", zh: "找不到该格子。" },
  "Le titre affiché au client ne peut pas être vide.": {
    en: "The title shown to the customer can't be empty.",
    zh: "显示给顾客的标题不能为空。",
  },
  "La validité du lot va de 1 à 365 jours.": {
    en: "Prize validity ranges from 1 to 365 days.",
    zh: "奖品有效期为 1 至 365 天。",
  },
  "Le délai avant de rejouer va de 0 à 365 jours.": {
    en: "The delay before playing again ranges from 0 to 365 days.",
    zh: "再次参与间隔为 0 至 365 天。",
  },
  "Un code fait six caractères, sans I, O, 0 ni 1.": {
    en: "A code is six characters, with no I, O, 0 or 1.",
    zh: "兑换码为六个字符，不含 I、O、0 和 1。",
  },
  "La recherche a échoué. Réessaie.": {
    en: "The search failed. Try again.",
    zh: "查找失败，请重试。",
  },
  "Ce code n'existe pas chez vous.": {
    en: "This code doesn't exist at your restaurant.",
    zh: "您的餐厅没有这个兑换码。",
  },
  "Lot introuvable.": { en: "Prize not found.", zh: "找不到该奖品。" },
  "Le retrait a échoué. Réessaie.": {
    en: "Redeeming failed. Try again.",
    zh: "兑换失败，请重试。",
  },
  "Ce lot vient d'être retiré, ou il est périmé.": {
    en: "This prize has just been redeemed, or it has expired.",
    zh: "该奖品刚刚已被兑换，或已过期。",
  },
};
