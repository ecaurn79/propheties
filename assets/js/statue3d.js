/* PRESCIENCE — module 3D de la statue de Daniel 2 (salle 07, état E10).
   Dépendance vendorisée localement (R13) : three 0.186.1, aucune requête réseau,
   aucune texture externe : la statue est construite en maillages primitifs.
   Repli : si WebGL ou un composant manque, le module ne monte rien et le
   tableau statique de la page conserve toute l'information.
   Accessibilité : le canvas est décoratif (aria-hidden) ; les commandes et le
   panneau d'information sont injectés par ce script et utilisables au clavier.
   Respect de prefers-reduced-motion : la rotation automatique est désactivée. */
import * as THREE from "/assets/vendor/three/three.module.js";

(function () {
  "use strict";

  var hote = document.querySelector("[data-statue]");
  if (!hote) { return; }

  var REDUIT = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Données strictement bornées aux jalons antiques (ADR-018) : le pied fer/argile
  // reste une lecture prophétique, aucune puissance contemporaine n'est nommée comme
  // fait externe ; la pierre relève du Royaume annoncé, sans date (R05).
  var SEGMENTS = [
    {
      id: "or", metal: "Tête d'or fin",
      puissance: "Babylone",
      date: "VIe siècle av. n. è. — règne de Nébucadnezzar II",
      reference: "Daniel 2:32, 38",
      texte: "La tête d'or figure la première puissance, Babylone, dont le roi reçoit l'interprétation : c'est lui la tête d'or. La chronique de Nabonide et les tablettes néo-babyloniennes documentent cet empire (salle 02)."
    },
    {
      id: "argent", metal: "Poitrine et bras d'argent",
      puissance: "Médie et Perse",
      date: "Chute de Babylone en 539 av. n. è. sous Cyrus",
      reference: "Daniel 2:32, 39 ; 8:20",
      texte: "Le second royaume, moindre que le premier, abat Babylone. Daniel 8 nomme lui-même le bélier à deux cornes : les rois de Médie et de Perse. La prise de Babylone sans combat est enregistrée sur la chronique BM 35382."
    },
    {
      id: "airain", metal: "Ventre et cuisses d'airain",
      puissance: "Grèce",
      date: "Conquêtes d'Alexandre, 334-323 av. n. è. ; partage après 323",
      reference: "Daniel 2:32, 39 ; 8:21-22",
      texte: "Le troisième royaume domine toute la terre. Daniel 8 identifie le bouc velu au roi de Javan (la Grèce), dont la grande corne, Alexandre, se brise et fait place à quatre cornes : les royaumes des successeurs."
    },
    {
      id: "fer", metal: "Jambes de fer",
      puissance: "Rome",
      date: "Victoire de Pydna en 168 av. n. è. ; Pompée à Jérusalem en 63 av. n. è.",
      reference: "Daniel 2:33, 40 ; 7:23",
      texte: "Le quatrième royaume est fort comme le fer, qui écrase et met en pièces. Rome hérite de tout l'espace hellénistique et broie les puissances précédentes, comme l'annonçait aussi la quatrième bête de la vision nocturne."
    },
    {
      id: "melange", metal: "Pieds de fer mêlé d'argile",
      puissance: "Phase finale divisée",
      date: "Lecture prophétique — aucun fait externe publié",
      reference: "Daniel 2:33, 41-43",
      texte: "Les pieds mêlent la dureté du fer à la fragilité de l'argile : une phase forte mais divisée. Conformément à sa méthode, le musée n'identifie ici aucune puissance moderne comme un fait historique vérifiable ; ce segment relève de la lecture prophétique interne."
    }
  ];

  var PIERRE = {
    metal: "La pierre détachée sans mains",
    puissance: "Le Royaume que le Dieu du ciel suscite",
    date: "Aucune date n'est révélée — le musée n'en propose aucune",
    reference: "Daniel 2:34, 44-45",
    texte: "Une pierre détachée sans intervention humaine brise la statue à ses pieds et devient une grande montagne. Daniel 2:44 l'explique : le Dieu du ciel suscite un royaume qui ne sera jamais détruit. Le texte ne donne pas de date, et le musée n'en invente pas."
  };

  function echapper(chaine) {
    return String(chaine).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  } catch (erreur) {
    hote.setAttribute("data-indisponible", "");
    return; // repli : le tableau statique de la page reste seul.
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.setClearColor(0x000000, 0);

  var scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x0b1018, 9, 16);

  var camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  camera.position.set(0, 2.7, 9.2);
  camera.lookAt(0, 2.0, 0);

  // Éclairage : lumière froide d'ambiance et projecteur chaud doré.
  scene.add(new THREE.AmbientLight(0x8fa3bd, 0.55));
  var projecteur = new THREE.DirectionalLight(0xffe6b0, 1.5);
  projecteur.position.set(4, 7, 5);
  projecteur.castShadow = true;
  projecteur.shadow.mapSize.set(1024, 1024);
  projecteur.shadow.camera.left = -3;
  projecteur.shadow.camera.right = 3;
  projecteur.shadow.camera.top = 5;
  projecteur.shadow.camera.bottom = -1;
  scene.add(projecteur);
  var contrejour = new THREE.DirectionalLight(0x6f8fc0, 0.6);
  contrejour.position.set(-5, 3, -4);
  scene.add(contrejour);

  function materiau(couleur, metal, rugosite) {
    return new THREE.MeshStandardMaterial({
      color: couleur, metalness: metal, roughness: rugosite
    });
  }

  var MAT = {
    or: materiau(0xd4af37, 0.95, 0.28),
    argent: materiau(0xc7ccd4, 0.95, 0.32),
    airain: materiau(0xcd7f32, 0.9, 0.38),
    fer: materiau(0x5d626a, 0.85, 0.42),
    argile: materiau(0xa06a44, 0.1, 0.85),
    pierre: materiau(0x9aa0a8, 0.05, 0.9),
    socle: materiau(0x20262e, 0.2, 0.8)
  };

  function inscrire(groupe, id) {
    groupe.userData.idSegment = id;
    groupe.traverse(function (objet) {
      if (objet.isMesh) {
        objet.castShadow = true;
        objet.receiveShadow = true;
        objet.userData.idSegment = id;
      }
    });
    return groupe;
  }

  var racine = new THREE.Group();
  scene.add(racine);
  var groupes = {};

  // Socle.
  var socle = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.28, 1.3), MAT.socle);
  socle.position.y = 0.14;
  socle.receiveShadow = true;
  racine.add(socle);

  // Pieds : deux blocs par pied, fer et argile accolés (mélange annoncé).
  ["melange"].forEach(function () {
    var g = new THREE.Group();
    [-1, 1].forEach(function (cote) {
      var blocFer = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.24, 0.42), MAT.fer);
      blocFer.position.set(cote * 0.24 - 0.07, 0.4, 0);
      var blocArgile = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.24, 0.42), MAT.argile);
      blocArgile.position.set(cote * 0.24 + 0.07, 0.4, 0);
      g.add(blocFer, blocArgile);
    });
    racine.add(inscrire(g, "melange"));
    groupes.melange = g;
  });

  // Jambes de fer.
  (function () {
    var g = new THREE.Group();
    [-1, 1].forEach(function (cote) {
      var jambe = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.16, 1.25, 24), MAT.fer);
      jambe.position.set(cote * 0.2, 1.12, 0);
      g.add(jambe);
    });
    racine.add(inscrire(g, "fer"));
    groupes.fer = g;
  })();

  // Ventre et cuisses d'airain.
  (function () {
    var g = new THREE.Group();
    var bassin = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.34, 0.55, 28), MAT.airain);
    bassin.position.y = 1.95;
    g.add(bassin);
    var ceinture = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.5, 0.5), MAT.airain);
    ceinture.position.y = 2.25;
    g.add(ceinture);
    racine.add(inscrire(g, "airain"));
    groupes.airain = g;
  })();

  // Torse et bras d'argent.
  (function () {
    var g = new THREE.Group();
    var torse = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.42, 0.95, 28), MAT.argent);
    torse.position.y = 2.9;
    g.add(torse);
    [-1, 1].forEach(function (cote) {
      var bras = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 1.05, 20), MAT.argent);
      bras.position.set(cote * 0.62, 2.85, 0);
      bras.rotation.z = cote * 0.18;
      g.add(bras);
    });
    var cou = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.15, 0.22, 20), MAT.argent);
    cou.position.y = 3.5;
    g.add(cou);
    racine.add(inscrire(g, "argent"));
    groupes.argent = g;
  })();

  // Tête d'or.
  (function () {
    var g = new THREE.Group();
    var tete = new THREE.Mesh(new THREE.SphereGeometry(0.3, 32, 24), MAT.or);
    tete.position.y = 3.85;
    g.add(tete);
    racine.add(inscrire(g, "or"));
    groupes.or = g;
  })();

  // La pierre, posée au sol sur le côté, non intégrée aux puissances humaines.
  var pierre = new THREE.Mesh(new THREE.DodecahedronGeometry(0.26, 0), MAT.pierre);
  pierre.position.set(1.25, 0.42, 0.35);
  pierre.castShadow = true;
  pierre.userData.idSegment = "pierre";
  racine.add(pierre);

  // Surbrillance de sélection.
  var selectionne = null;
  function appliquer(id) {
    Object.keys(groupes).forEach(function (cle) {
      groupes[cle].traverse(function (objet) {
        if (objet.isMesh && objet.material.emissive) {
          objet.material.emissive.setHex(cle === id ? 0x3a2f05 : 0x000000);
        }
      });
    });
    selectionne = id;
    document.querySelectorAll("[data-bouton-segment]").forEach(function (bouton) {
      bouton.setAttribute("aria-pressed", String(bouton.dataset.boutonSegment === id));
    });
  }

  // Interface injectée par le script : aucun contrôle mort sans JavaScript.
  var interface_ = document.createElement("div");
  interface_.className = "statue-interface";
  var boutons = SEGMENTS.map(function (s) {
    return '<button type="button" class="bouton-metal" data-bouton-segment="' +
      echapper(s.id) + '" aria-pressed="false">' + echapper(s.metal) + "</button>";
  }).join("");
  interface_.innerHTML =
    '<div class="statue-boutons" role="group" aria-label="Choisir une partie de la statue">' +
    boutons +
    '<button type="button" class="bouton-metal bouton-pierre" data-bouton-segment="pierre" aria-pressed="false">La pierre</button>' +
    "</div>" +
    '<div class="statue-panneau" role="status" aria-live="polite" data-panneau></div>';
  hote.appendChild(interface_);

  var panneau = interface_.querySelector("[data-panneau]");
  function afficher(donnee) {
    panneau.innerHTML =
      '<h3>' + echapper(donnee.metal) + "</h3>" +
      '<p class="panneau-puissance">' + echapper(donnee.puissance) + "</p>" +
      '<p class="panneau-date">' + echapper(donnee.date) + "</p>" +
      '<p class="panneau-reference">' + echapper(donnee.reference) + "</p>" +
      "<p>" + echapper(donnee.texte) + "</p>";
  }
  afficher(SEGMENTS[0]);
  appliquer("or");

  interface_.addEventListener("click", function (e) {
    var bouton = e.target.closest("[data-bouton-segment]");
    if (!bouton) { return; }
    var id = bouton.dataset.boutonSegment;
    if (id === "pierre") {
      appliquer(null);
      bouton.setAttribute("aria-pressed", "true");
      afficher(PIERRE);
      return;
    }
    appliquer(id);
    afficher(SEGMENTS.filter(function (s) { return s.id === id; })[0]);
  });

  // Canvas et montage DOM.
  var zone = document.createElement("div");
  zone.className = "statue-canvas";
  hote.insertBefore(zone, interface_);
  zone.appendChild(renderer.domElement);
  renderer.domElement.setAttribute("aria-hidden", "true");

  // Rotation par glisser (pas d'OrbitControls vendorisée : contrôle manuel).
  var glisse = false;
  var precedentX = 0;
  var cibleRotation = 0;
  renderer.domElement.style.touchAction = "pan-y";
  renderer.domElement.addEventListener("pointerdown", function (e) {
    glisse = true;
    precedentX = e.clientX;
    renderer.domElement.setPointerCapture(e.pointerId);
  });
  renderer.domElement.addEventListener("pointermove", function (e) {
    if (!glisse) { return; }
    cibleRotation += (e.clientX - precedentX) * 0.01;
    precedentX = e.clientX;
  });
  ["pointerup", "pointercancel"].forEach(function (nom) {
    renderer.domElement.addEventListener(nom, function () { glisse = false; });
  });

  // Clic sur un segment 3D (raycaster).
  var rayon = new THREE.Raycaster();
  var pointeur = new THREE.Vector2();
  renderer.domElement.addEventListener("click", function (e) {
    var rect = renderer.domElement.getBoundingClientRect();
    pointeur.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    pointeur.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    rayon.setFromCamera(pointeur, camera);
    var touche = rayon.intersectObjects(racine.children, true)[0];
    if (!touche || !touche.object.userData.idSegment) { return; }
    var id = touche.object.userData.idSegment;
    if (id === "pierre") {
      appliquer(null);
      afficher(PIERRE);
      var bp = interface_.querySelector('[data-bouton-segment="pierre"]');
      if (bp) { bp.setAttribute("aria-pressed", "true"); }
      return;
    }
    appliquer(id);
    afficher(SEGMENTS.filter(function (s) { return s.id === id; })[0]);
  });

  function redimensionner() {
    var largeur = Math.max(zone.clientWidth, 280);
    var hauteur = Math.max(zone.clientHeight, 360);
    renderer.setSize(largeur, hauteur, false);
    camera.aspect = largeur / hauteur;
    camera.updateProjectionMatrix();
  }
  if (window.ResizeObserver) {
    new ResizeObserver(redimensionner).observe(zone);
  }
  window.addEventListener("resize", redimensionner);
  redimensionner();

  // Boucle de rendu : rotation lente sauf mouvement réduit ou glisser actif.
  function image() {
    requestAnimationFrame(image);
    if (!REDUIT && !glisse) { cibleRotation += 0.0025; }
    racine.rotation.y += (cibleRotation - racine.rotation.y) * 0.12;
    renderer.render(scene, camera);
  }
  image();
})();
