/*
 * Klarr — le module de réservation à poser sur le site d'un restaurant.
 *
 *   <script src="https://klarr.net/widget.js" data-restaurant="mon-restaurant" async></script>
 *
 * Il ajoute un bouton « Réserver une table » (flottant en bas à droite,
 * ou à l'endroit du script avec data-mode="bouton"). Au clic, la page de
 * réservation Klarr s'ouvre par-dessus le site, sans le quitter.
 *
 * Tout élément du site portant l'attribut data-klarr-reserver ouvre la
 * même fenêtre : le restaurateur peut garder ses propres boutons.
 *
 * Options : data-texte (le libellé), data-couleur (le fond du bouton),
 * data-mode ("flottant" par défaut, ou "bouton").
 *
 * Aucune dépendance, aucun témoin, aucune donnée lue sur le site hôte.
 */
(function () {
  "use strict";

  var script = document.currentScript;
  if (!script || !script.src) return;
  var slug = script.getAttribute("data-restaurant");
  if (!slug) return;

  // Deux copies du script pour la même maison ne font qu'un bouton.
  window.__klarrWidgets = window.__klarrWidgets || {};
  if (window.__klarrWidgets[slug]) return;
  window.__klarrWidgets[slug] = true;

  var origine = new URL(script.src).origin;
  var adresse =
    origine + "/reserver/" + encodeURIComponent(slug) + "?integre=1";

  var langue = (document.documentElement.lang || "fr").slice(0, 2);
  var MOTS = {
    fr: { reserver: "Réserver une table", fermer: "Fermer" },
    en: { reserver: "Book a table", fermer: "Close" },
    zh: { reserver: "预订餐位", fermer: "关闭" },
  };
  var mots = MOTS[langue] || MOTS.fr;
  var texte = script.getAttribute("data-texte") || mots.reserver;
  var couleur = script.getAttribute("data-couleur") || "#1f1b17";
  var mode = script.getAttribute("data-mode") || "flottant";
  var police =
    "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

  var fond = null;
  var cadre = null;
  var declencheur = null;

  function fermer() {
    if (!fond) return;
    fond.style.display = "none";
    document.documentElement.style.overflow = "";
    if (declencheur && declencheur.focus) declencheur.focus();
  }

  function construire() {
    fond = document.createElement("div");
    fond.setAttribute("role", "dialog");
    fond.setAttribute("aria-modal", "true");
    fond.setAttribute("aria-label", texte);
    fond.style.cssText =
      "position:fixed;inset:0;z-index:2147483646;display:none;align-items:center;justify-content:center;background:rgba(20,17,14,.55);padding:16px;box-sizing:border-box;";

    var boite = document.createElement("div");
    boite.style.cssText =
      "position:relative;width:100%;max-width:780px;height:min(92vh,920px);background:#faf7f2;border-radius:16px;overflow:hidden;box-shadow:0 30px 80px rgba(0,0,0,.35);";

    var croix = document.createElement("button");
    croix.type = "button";
    croix.setAttribute("aria-label", mots.fermer);
    croix.textContent = "×";
    croix.style.cssText =
      "position:absolute;top:10px;right:10px;z-index:1;width:38px;height:38px;border:0;border-radius:999px;background:#fff;color:#1f1b17;font:600 24px/38px " +
      police +
      ";cursor:pointer;box-shadow:0 2px 10px rgba(0,0,0,.15);";
    croix.addEventListener("click", fermer);

    cadre = document.createElement("iframe");
    cadre.title = texte;
    cadre.src = adresse;
    cadre.setAttribute("allow", "payment");
    cadre.style.cssText = "width:100%;height:100%;border:0;display:block;";

    boite.appendChild(croix);
    boite.appendChild(cadre);
    fond.appendChild(boite);
    fond.addEventListener("click", function (e) {
      if (e.target === fond) fermer();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") fermer();
    });
    document.body.appendChild(fond);
    return croix;
  }

  function ouvrir(e) {
    if (e) e.preventDefault();
    declencheur = (e && e.currentTarget) || null;
    var croix = fond ? fond.querySelector("button") : construire();
    // Sur un téléphone, la fenêtre prend tout l'écran : une marge de
    // seize pixels autour d'un formulaire ne sert qu'à le rétrécir.
    var etroit = window.innerWidth < 640;
    var boite = fond.firstChild;
    fond.style.padding = etroit ? "0" : "16px";
    boite.style.height = etroit ? "100%" : "min(92vh,920px)";
    boite.style.borderRadius = etroit ? "0" : "16px";
    fond.style.display = "flex";
    document.documentElement.style.overflow = "hidden";
    if (croix && croix.focus) croix.focus();
  }

  function bouton() {
    var a = document.createElement("a");
    a.href = adresse.replace("?integre=1", "");
    a.target = "_blank";
    a.rel = "noopener";
    a.textContent = texte;
    a.setAttribute("aria-haspopup", "dialog");
    a.style.cssText =
      "display:inline-block;padding:14px 24px;border-radius:999px;background:" +
      couleur +
      ";color:#fff;font:600 15px/1 " +
      police +
      ";text-decoration:none;box-shadow:0 10px 30px rgba(0,0,0,.2);cursor:pointer;";
    a.addEventListener("click", ouvrir);
    return a;
  }

  function monter() {
    if (mode === "bouton") {
      script.parentNode.insertBefore(bouton(), script.nextSibling);
    } else {
      var b = bouton();
      b.style.position = "fixed";
      b.style.right = "20px";
      b.style.bottom = "20px";
      b.style.zIndex = "2147483645";
      document.body.appendChild(b);
    }
    var perso = document.querySelectorAll("[data-klarr-reserver]");
    for (var i = 0; i < perso.length; i++) {
      perso[i].addEventListener("click", ouvrir);
    }
  }

  if (document.body) monter();
  else document.addEventListener("DOMContentLoaded", monter);
})();
