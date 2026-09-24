import type { Langue } from "@/lib/i18n/langue";

/**
 * Les factures et les informations de facturation, sur l'écran
 * d'abonnement, dans les trois langues.
 */
export type ClesFacturation = {
  facturesTitre: string;
  facturesAside: (n: number) => string;
  facturesVide: string;
  facturesVideEssai: string;
  colDate: string;
  colNumero: string;
  colMontant: string;
  statuts: Record<"payee" | "a_regler" | "annulee" | "autre", string>;
  telecharger: string;
  regler: string;
  facturesPied: string;

  infosTitre: string;
  infosChapo: string;
  nom: string;
  nomAide: string;
  email: string;
  emailAide: string;
  ligne1: string;
  ligne2: string;
  codePostal: string;
  ville: string;
  pays: string;
  siret: string;
  siretAide: string;
  tva: string;
  tvaAide: string;
  enregistrer: string;
  prochainesFactures: string;
  retours: Record<
    "ok" | "incomplet" | "siret" | "tva" | "erreur" | "migration",
    string
  >;
  moyenDePaiement: string;
};

const fr: ClesFacturation = {
  facturesTitre: "Factures",
  facturesAside: (n) => `${n} facture${n > 1 ? "s" : ""}`,
  facturesVide: "Aucune facture pour l'instant.",
  facturesVideEssai:
    "Ta première facture arrivera avec le premier prélèvement, à la fin de l'essai.",
  colDate: "Date",
  colNumero: "Numéro",
  colMontant: "Montant TTC",
  statuts: {
    payee: "Payée",
    a_regler: "À régler",
    annulee: "Annulée",
    autre: "En cours",
  },
  telecharger: "PDF",
  regler: "Régler",
  facturesPied:
    "Chaque facture part aussi par e-mail à l'adresse de facturation, le jour du prélèvement.",

  infosTitre: "Informations de facturation",
  infosChapo: "Ce qui figure sur tes factures Klarr.",
  nom: "Raison sociale",
  nomAide: "La société qui exploite le restaurant, telle qu'au Kbis.",
  email: "E-mail de facturation",
  emailAide: "Celui de ton comptable, si c'est lui qui les range.",
  ligne1: "Adresse",
  ligne2: "Complément (facultatif)",
  codePostal: "Code postal",
  ville: "Ville",
  pays: "Pays",
  siret: "SIRET (facultatif)",
  siretAide: "14 chiffres, ou les 9 du SIREN.",
  tva: "N° de TVA intracommunautaire (facultatif)",
  tvaAide: "FR suivi de 11 chiffres. Il est vérifié à l'enregistrement.",
  enregistrer: "Enregistrer",
  prochainesFactures:
    "S'applique aux prochaines factures : une facture déjà émise ne se modifie plus.",
  retours: {
    ok: "Enregistré. Tes prochaines factures porteront ces informations.",
    incomplet: "Il manque la raison sociale, l'e-mail ou l'adresse complète.",
    siret: "Le SIRET compte 14 chiffres (ou 9 pour le SIREN).",
    tva: "Adresse enregistrée, mais ce numéro de TVA a été refusé : vérifie-le (FR puis 11 chiffres).",
    erreur: "L'enregistrement n'a pas abouti. Réessaie dans un instant.",
    migration:
      "La migration 0088 n'est pas encore passée : l'enregistrement reprendra ensuite.",
  },
  moyenDePaiement: "Changer de carte ou résilier",
};

const en: ClesFacturation = {
  facturesTitre: "Invoices",
  facturesAside: (n) => `${n} invoice${n > 1 ? "s" : ""}`,
  facturesVide: "No invoices yet.",
  facturesVideEssai:
    "Your first invoice will come with the first payment, at the end of the trial.",
  colDate: "Date",
  colNumero: "Number",
  colMontant: "Amount incl. VAT",
  statuts: {
    payee: "Paid",
    a_regler: "Due",
    annulee: "Void",
    autre: "Pending",
  },
  telecharger: "PDF",
  regler: "Pay",
  facturesPied:
    "Each invoice is also emailed to the billing address on the day of payment.",

  infosTitre: "Billing details",
  infosChapo: "What appears on your Klarr invoices.",
  nom: "Company name",
  nomAide: "The company that runs the restaurant, as registered.",
  email: "Billing email",
  emailAide: "Your accountant's, if they file them.",
  ligne1: "Address",
  ligne2: "Address line 2 (optional)",
  codePostal: "Postcode",
  ville: "City",
  pays: "Country",
  siret: "SIRET (optional)",
  siretAide: "14 digits, or the 9 of the SIREN.",
  tva: "EU VAT number (optional)",
  tvaAide: "Country code followed by the number. It is checked on save.",
  enregistrer: "Save",
  prochainesFactures:
    "Applies to future invoices: an invoice already issued can no longer be changed.",
  retours: {
    ok: "Saved. Your next invoices will carry these details.",
    incomplet: "The company name, email or full address is missing.",
    siret: "A SIRET has 14 digits (or 9 for a SIREN).",
    tva: "Address saved, but this VAT number was rejected: please check it.",
    erreur: "Saving failed. Please try again in a moment.",
    migration:
      "Migration 0088 has not been run yet: saving will work once it has.",
  },
  moyenDePaiement: "Change card or cancel",
};

const zh: ClesFacturation = {
  facturesTitre: "发票",
  facturesAside: (n) => `${n} 张发票`,
  facturesVide: "暂无发票。",
  facturesVideEssai: "第一张发票将在试用期结束、首次扣款时开出。",
  colDate: "日期",
  colNumero: "编号",
  colMontant: "含税金额",
  statuts: {
    payee: "已付",
    a_regler: "待付",
    annulee: "已作废",
    autre: "处理中",
  },
  telecharger: "PDF",
  regler: "付款",
  facturesPied: "每张发票也会在扣款当天发送到开票邮箱。",

  infosTitre: "开票信息",
  infosChapo: "显示在您的 Klarr 发票上的信息。",
  nom: "公司名称",
  nomAide: "经营餐厅的公司，与营业执照（Kbis）一致。",
  email: "开票邮箱",
  emailAide: "如果由会计整理发票，可填会计的邮箱。",
  ligne1: "地址",
  ligne2: "地址补充（选填）",
  codePostal: "邮编",
  ville: "城市",
  pays: "国家",
  siret: "SIRET（选填）",
  siretAide: "14 位数字，或 SIREN 的 9 位。",
  tva: "欧盟增值税号（选填）",
  tvaAide: "FR 加 11 位数字。保存时会进行校验。",
  enregistrer: "保存",
  prochainesFactures: "仅对之后的发票生效：已开出的发票无法再修改。",
  retours: {
    ok: "已保存。之后的发票将显示这些信息。",
    incomplet: "缺少公司名称、邮箱或完整地址。",
    siret: "SIRET 为 14 位数字（SIREN 为 9 位）。",
    tva: "地址已保存，但增值税号被拒绝：请核对（FR 加 11 位数字）。",
    erreur: "保存失败，请稍后再试。",
    migration: "0088 号迁移尚未执行：执行后即可保存。",
  },
  moyenDePaiement: "更换银行卡或取消订阅",
};

export const FACTURATION: Record<Langue, ClesFacturation> = { fr, en, zh };
