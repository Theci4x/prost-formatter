"use client";

import { useEffect, useState } from "react";
import {
  enregistrerAbonnement,
  envoyerTest,
  retirerAbonnement,
} from "@/app/dashboard/[id]/notifications/actions";

/**
 * L'activation des notifications, appareil par appareil.
 *
 * Une permission ne se demande jamais au chargement d'une page : le
 * navigateur la retient, et un « Bloquer » réflexe est presque
 * irrécupérable — il faut aller la rechercher dans les réglages du
 * téléphone. Elle ne part donc qu'au clic, une fois qu'on a expliqué à
 * quoi elle sert.
 *
 * Tout est propre à l'appareil : le patron active sur son téléphone, son
 * gérant sur le sien, et chacun voit l'état du sien.
 */

type Etat =
  | "chargement"
  | "impossible"
  | "ios-a-installer"
  | "refusee"
  | "inactive"
  | "active";

/**
 * La clé publique VAPID, au format que réclame le navigateur.
 *
 * Le tampon est alloué explicitement : `new Uint8Array(n)` porte un
 * `ArrayBufferLike`, que le typage de `applicationServerKey` refuse.
 */
function versUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const bourrage = "=".repeat((4 - (base64.length % 4)) % 4);
  const propre = (base64 + bourrage).replace(/-/g, "+").replace(/_/g, "/");
  const brut = window.atob(propre);
  const sortie = new Uint8Array(new ArrayBuffer(brut.length));
  for (let i = 0; i < brut.length; i += 1) sortie[i] = brut.charCodeAt(i);
  return sortie;
}

/** « iPhone », « Android », « Mac »… pour reconnaître l'appareil dans la liste. */
function nomAppareil(): string {
  const ua = navigator.userAgent;
  if (/iPhone/.test(ua)) return "iPhone";
  if (/iPad/.test(ua)) return "iPad";
  if (/Android/.test(ua)) return "Android";
  if (/Macintosh/.test(ua)) return "Mac";
  if (/Windows/.test(ua)) return "Windows";
  return "Cet appareil";
}

export function ActiverNotifications({
  restaurantId,
}: {
  restaurantId: string;
}) {
  const [etat, setEtat] = useState<Etat>("chargement");
  const [erreur, setErreur] = useState<string | null>(null);
  const [teste, setTeste] = useState(false);
  const [enCours, setEnCours] = useState(false);

  useEffect(() => {
    // La détection ne touche pas l'état : elle renvoie un verdict, et
    // c'est la continuation qui l'applique. Poser l'état au beau milieu
    // d'un effet ferait rendre le composant deux fois pour rien — et
    // `vivant` évite d'écrire dans un composant déjà démonté.
    let vivant = true;

    async function examiner(): Promise<Etat> {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        // Sur iPhone, l'API n'existe que dans l'application installée. Le
        // dire, plutôt qu'annoncer « votre navigateur ne sait pas faire ».
        return /iPhone|iPad|iPod/.test(navigator.userAgent)
          ? "ios-a-installer"
          : "impossible";
      }
      if (Notification.permission === "denied") return "refusee";

      const enregistrement = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
        updateViaCache: "none",
      });
      const abonnement = await enregistrement.pushManager.getSubscription();
      return abonnement ? "active" : "inactive";
    }

    examiner()
      .then((verdict) => {
        if (vivant) setEtat(verdict);
      })
      .catch((cause) => {
        console.error("[notifications]", cause);
        if (vivant) setEtat("impossible");
      });

    return () => {
      vivant = false;
    };
  }, []);

  async function activer() {
    setEnCours(true);
    setErreur(null);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setEtat(permission === "denied" ? "refusee" : "inactive");
        return;
      }

      const enregistrement = await navigator.serviceWorker.ready;
      const abonnement = await enregistrement.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: versUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
        ),
      });

      const brut = abonnement.toJSON();
      const donnees = new FormData();
      donnees.set("restaurant_id", restaurantId);
      donnees.set("endpoint", abonnement.endpoint);
      donnees.set("p256dh", brut.keys?.p256dh ?? "");
      donnees.set("auth", brut.keys?.auth ?? "");
      donnees.set("appareil", nomAppareil());

      const reponse = await enregistrerAbonnement(
        { erreur: null, fait: false },
        donnees,
      );
      if (reponse.erreur) {
        // Enregistré nulle part, l'abonnement ne servirait qu'à croire
        // qu'on est prévenu : on le défait.
        await abonnement.unsubscribe();
        setErreur(reponse.erreur);
        setEtat("inactive");
        return;
      }
      setEtat("active");
    } catch (cause) {
      console.error("[notifications] activation", cause);
      setErreur("L'activation a échoué sur cet appareil.");
    } finally {
      setEnCours(false);
    }
  }

  async function desactiver() {
    setEnCours(true);
    setErreur(null);
    try {
      const enregistrement = await navigator.serviceWorker.ready;
      const abonnement = await enregistrement.pushManager.getSubscription();
      if (abonnement) {
        const donnees = new FormData();
        donnees.set("endpoint", abonnement.endpoint);
        await retirerAbonnement({ erreur: null, fait: false }, donnees);
        await abonnement.unsubscribe();
      }
      setEtat("inactive");
      setTeste(false);
    } catch (cause) {
      console.error("[notifications] désactivation", cause);
      setErreur("La désactivation a échoué.");
    } finally {
      setEnCours(false);
    }
  }

  async function tester() {
    setEnCours(true);
    setErreur(null);
    const donnees = new FormData();
    donnees.set("restaurant_id", restaurantId);
    const reponse = await envoyerTest({ erreur: null, fait: false }, donnees);
    setErreur(reponse.erreur);
    setTeste(reponse.fait);
    setEnCours(false);
  }

  if (etat === "chargement") {
    return (
      <p className="text-sm text-ink-soft">Vérification de cet appareil…</p>
    );
  }

  if (etat === "ios-a-installer") {
    return (
      <div className="flex flex-col gap-3 rounded-2xl border border-line bg-brand-orange-soft p-5">
        <p className="font-semibold text-ink">
          Sur iPhone, ajoutez d&apos;abord Klarr à votre écran d&apos;accueil.
        </p>
        <p className="text-sm leading-relaxed text-ink-soft">
          Apple n&apos;autorise les notifications que pour les applications
          installées. Dans Safari, touchez le bouton{" "}
          <span aria-hidden="true">⎋</span> Partager en bas de l&apos;écran,
          puis <strong>Sur l&apos;écran d&apos;accueil</strong>. Rouvrez Klarr
          depuis l&apos;icône et revenez ici : le bouton d&apos;activation
          apparaîtra.
        </p>
      </div>
    );
  }

  if (etat === "impossible") {
    return (
      <p className="text-sm text-ink-soft">
        Ce navigateur ne sait pas recevoir de notifications. Essayez depuis
        Chrome, Safari ou Firefox à jour.
      </p>
    );
  }

  if (etat === "refusee") {
    return (
      <div className="flex flex-col gap-2 rounded-2xl border border-line bg-brand-cream p-5">
        <p className="font-semibold text-ink">
          Les notifications sont bloquées sur cet appareil.
        </p>
        <p className="text-sm leading-relaxed text-ink-soft">
          Le blocage vient du navigateur, pas de Klarr : nous ne pouvons plus le
          demander nous-mêmes. Autorisez les notifications pour klarr.net dans
          les réglages de votre navigateur, puis rechargez cette page.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <span
          className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold ${
            etat === "active"
              ? "bg-emerald-50 text-emerald-800"
              : "bg-brand-sand text-ink-soft"
          }`}
        >
          <span
            aria-hidden="true"
            className={`h-2 w-2 rounded-full ${
              etat === "active" ? "bg-emerald-500" : "bg-ink-soft/40"
            }`}
          />
          {nomAppareil()} — {etat === "active" ? "activé" : "pas encore activé"}
        </span>
      </div>

      <div className="flex flex-wrap gap-3">
        {etat === "active" ? (
          <>
            <button
              type="button"
              onClick={tester}
              disabled={enCours}
              className="rounded-lg bg-ink px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-navy disabled:opacity-50"
            >
              {enCours ? "Envoi…" : "Envoyer une notification d'essai"}
            </button>
            <button
              type="button"
              onClick={desactiver}
              disabled={enCours}
              className="rounded-lg border border-line bg-paper px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-ink disabled:opacity-50"
            >
              Désactiver sur cet appareil
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={activer}
            disabled={enCours}
            className="rounded-lg bg-ink px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-navy disabled:opacity-50"
          >
            {enCours ? "Activation…" : "Activer sur cet appareil"}
          </button>
        )}
      </div>

      {teste && (
        <p className="text-sm text-emerald-700">
          Envoyée. Elle doit arriver dans les secondes qui viennent —
          verrouillez l&apos;écran pour la voir comme un vrai soir de service.
        </p>
      )}
      {erreur && <p className="text-sm text-red-600">{erreur}</p>}
    </div>
  );
}
