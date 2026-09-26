import type { Langue } from "@/lib/i18n/langue";

/**
 * L'écran des liaisons coupées.
 *
 * Il dit deux choses, et il faut les deux : tu es toujours connecté — ne
 * cherche pas ton mot de passe —, et rien de ce qui est en base n'a
 * bougé. Un restaurateur qui voit un écran d'erreur en plein service
 * pense d'abord qu'il a perdu ses réservations.
 */

export type ClesSession = {
  titre: string;
  chapo: string;
  rassurance: string;
  reessayer: string;
};

export const SESSION: Record<Langue, ClesSession> = {
  fr: {
    titre: "Connexion au serveur interrompue",
    chapo:
      "Klarr n'arrive pas à joindre ses serveurs pour l'instant. Tu es toujours connecté : ce n'est pas la peine de ressaisir ton mot de passe.",
    rassurance:
      "Tes réservations, ta carte et tes réglages sont en base et n'ont pas bougé.",
    reessayer: "Réessayer",
  },
  en: {
    titre: "Connection to the server interrupted",
    chapo:
      "Klarr cannot reach its servers at the moment. You are still signed in: there is no need to type your password again.",
    rassurance:
      "Your bookings, your menu and your settings are in the database and have not moved.",
    reessayer: "Try again",
  },
  zh: {
    titre: "与服务器的连接中断",
    chapo: "Klarr 暂时连不上服务器。您仍然处于登录状态：不用重新输入密码。",
    rassurance: "您的订位、菜单和设置都在数据库里，没有任何改动。",
    reessayer: "重试",
  },
};
