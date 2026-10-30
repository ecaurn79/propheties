/* PRESCIENCE — interactions du socle (E03).
   Vanilla JS, aucune dépendance externe (R13).
   Respect de prefers-reduced-motion : ce script ne produit aucune animation,
   seulement des changements d'état accessibles au clavier. */
(function () {
  "use strict";

  var bouton = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".nav-principale");

  if (bouton && nav) {
    bouton.addEventListener("click", function () {
      var ouvert = nav.classList.toggle("ouvert");
      bouton.setAttribute("aria-expanded", ouvert ? "true" : "false");
    });

    // Fermeture du menu après activation d'un lien (mobile).
    nav.addEventListener("click", function (evenement) {
      if (evenement.target.closest("a")) {
        nav.classList.remove("ouvert");
        bouton.setAttribute("aria-expanded", "false");
      }
    });

    // Échappe ferme le menu.
    document.addEventListener("keydown", function (evenement) {
      if (evenement.key === "Escape" && nav.classList.contains("ouvert")) {
        nav.classList.remove("ouvert");
        bouton.setAttribute("aria-expanded", "false");
        bouton.focus();
      }
    });
  }

  // Année courante du pied de page (aucune date future inventée : simple horloge).
  var annee = document.querySelector("[data-annee-courante]");
  if (annee) {
    annee.textContent = String(new Date().getFullYear());
  }
})();
