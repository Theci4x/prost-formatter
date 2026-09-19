/**
 * Le service worker de Klarr.
 *
 * Il ne fait qu'une chose : afficher les notifications, et ouvrir le bon
 * écran quand on les touche. Pas de cache hors ligne — un carnet de
 * réservations servi depuis un cache périmé afficherait des tables qui
 * n'existent plus, ce qui est pire que pas de carnet du tout.
 */

self.addEventListener("push", (event) => {
  if (!event.data) return;

  let charge;
  try {
    charge = event.data.json();
  } catch {
    // Un message qu'on ne comprend pas ne doit pas rester muet : le
    // navigateur exige qu'un « push » affiche quelque chose, sous peine
    // de retirer la permission.
    charge = { titre: "Klarr", corps: "Vous avez du nouveau.", chemin: "/dashboard" };
  }

  event.waitUntil(
    self.registration.showNotification(charge.titre ?? "Klarr", {
      body: charge.corps ?? "",
      icon: "/icone-192.png",
      badge: "/badge-72.png",
      // Vibration courte : le téléphone est souvent en poche pendant le
      // service, il faut la sentir sans que ce soit une alarme.
      vibrate: [80, 40, 80],
      tag: charge.etiquette ?? "klarr",
      // Remplace silencieusement une notification de même étiquette
      // plutôt que d'en empiler trois pour la même table.
      renotify: false,
      data: { chemin: charge.chemin ?? "/dashboard" },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const chemin = event.notification.data?.chemin ?? "/dashboard";

  // Si Klarr est déjà ouvert quelque part, on y va plutôt que d'ouvrir un
  // deuxième onglet : en plein service, on n'a pas besoin de dix onglets.
  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((fenetres) => {
        for (const fenetre of fenetres) {
          if (new URL(fenetre.url).origin === self.location.origin) {
            return fenetre.navigate(chemin).then((f) => f?.focus());
          }
        }
        return self.clients.openWindow(chemin);
      }),
  );
});
