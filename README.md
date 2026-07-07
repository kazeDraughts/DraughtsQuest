# ⛀ DraughtsQuest

**Le RPG du jeu de dames internationales (10×10)** — jouable dans le
navigateur, sur PC (souris/clavier) et mobile/tablette (tactile), sans
installation.

Tim s'ennuie… jusqu'à ce que sa maman l'envoie chez Papi Marcel, qui lui
apprend le jeu de dames. Bats ton grand-père, inscris-toi au club de la ville
d'**Otterlaws** (anagramme de Wattrelos !), suis l'enseignement du grand
maître **Gigi**, gravis les échelons — tournoi du club, championnat régional,
national — et deviens **champion du monde**. En chemin, gagne des **Pions
d'Or** et personnalise ton damier et tes pièces dans la boutique de Mme Plot.

## 🚀 Lancer le jeu

Aucune étape de build, aucune dépendance à installer. Il faut juste servir
les fichiers en HTTP (les modules ES ne se chargent pas depuis `file://`) :

```bash
npm start          # mini serveur inclus (node tools/serve.mjs)
# puis ouvrir http://localhost:8080
```

ou n'importe quel serveur statique : `npx serve .`, `python3 -m http.server`…

## 🎮 Contrôles

| Contexte | PC | Mobile / tablette |
|---|---|---|
| Se déplacer | Flèches / ZQSD / WASD | Joystick virtuel (en bas à gauche) |
| Interagir / avancer le dialogue | E, Espace ou Entrée | Bouton **A** (en bas à droite) |
| Jouer un coup | Clic sur la pièce puis la case | Toucher la pièce puis la case |

## ✅ Règles implémentées (dames internationales, FMJD)

- damier 10×10, jeu sur cases sombres, 20 pions par camp ;
- pions : déplacement diagonal en avant, **prise obligatoire en avant comme
  en arrière** ;
- **rafle majoritaire obligatoire** : quand plusieurs prises existent, seule
  la capture du nombre maximal de pièces est légale ;
- promotion en **dame volante** (déplacement/prise à distance) uniquement si
  le pion **termine** son coup sur la dernière rangée ;
- victoire par blocage ou capture totale ; nulles (triple répétition,
  25 coups de dames sans prise ni coup de pion).

Ces règles sont vérifiées par des tests automatiques : `npm test`
(voir `tests/rules.test.mjs`, dont deux cas dédiés à la rafle majoritaire,
et `tests/ai.test.mjs` pour l'IA).

## 🎓 Salle d'entraînement

Au club (le **tableau noir** de Gigi, à gauche de l'entrée — ou le bouton
« Entraînement » du menu), 12 leçons interactives suivent le plan des cours
et livrets fédéraux (FFJD/FMJD) : **bases** (notation Manoury, rangée
arrière), **vision des rafles** (méthode « apprendre à prendre » : chaînes
de 4, 6 puis 8 prises à visualiser d'un coup), **tactique** (« donner un
pour reprendre deux », pion empoisonné, rafle majoritaire, dame volante,
passage à dame par sacrifice) et **finales** (course à la dame et temps,
opposition/zugzwang). Chaque exercice se joue sur le vrai moteur de règles,
propose un indice après deux échecs et rapporte des Pions d'Or à la première
réussite. Les positions sont **générées puis certifiées par recherche
minimax** (coup gagnant unique, toutes les défenses perdent, pas de finale
nulle cachée) ; `tests/training.test.mjs` rejoue chaque étape à chaque
`npm test`. Le contenu textuel est original (thèmes inspirés des livrets
pédagogiques de la FFJD, sans reproduction).

## 🧩 Les donneurs d'énigmes (chercher des combinaisons)

Après avoir battu Papi, trois PNJ proposent des **séries de combinaisons à
chercher** — sans leçon ni énoncé du coup : « les Blancs jouent et gagnent »,
à toi de trouver.

- **Fernand** 🎣 (l'étang du hameau) : *coups de deux* — un sacrifice, une
  reprise forcée, un pion de gain. Série complète → un **damier exclusif**
  introuvable en boutique.
- **Honoré** 🎩 (la place d'Otterlaws, débloqué par Fernand) : *grandes
  combinaisons* — rafles profondes, gains multiples. Série complète → des
  **pions de collection** exclusifs.
- **Séraphine** 🌙 (le recoin est d'Otterlaws, débloquée par Honoré) :
  *passages à dame* — chaque énigme se termine sur une promotion. Série
  complète → un **maître caché** apparaît dans le hameau… et il se joue
  en partie classée.

Chaque PNJ a désormais **deux réserves** : ses 6 énigmes de base
(générées), puis des **énigmes de collection** tirées des recueils
thématiques du site « Allons à dame » (coup royal, coup renversé, taquin,
marchand de bois, classique…) — vider toute la besace rapporte une prime.
Chaque énigme, quelle que soit son origine, est **certifiée par le
moteur** : premier coup gagnant unique (aucun autre coup ne gagne), chaque
réplique noire strictement forcée, gain net ou couronnement vérifié, pas
de finale nulle cachée. `tests/combos.test.mjs` rejoue et re-certifie
toute la banque à chaque `npm test`.

## 🏛️ L'Académie du Damier (les styles de parties)

À l'est d'Otterlaws (accès réservé aux membres du club), cinq professeurs
enseignent les grands **types de parties** aux néophytes — le programme est
tiré des cours et livrets fédéraux (livret Thiney, livret « La stratégie du
blocage » de J-P. Dubois) :

- **Maître Célestin** 🏛️ — *la partie classique* : partage du centre,
  colonnes, tenaille et la ligne du **dégagement classique** (19-23 !)
  rejouée coup par coup ;
- **Gaspard** 🧱 — *le système Ghestem* : gagner de l'espace par
  l'avancée 28-22 puis 33-28, bloquer tous les pions adverses ;
- **Salomé** 🌗 — *la partie semi-ouverte* : ne jamais attaquer le centre
  adverse de front — **l'encercler** (position certifiée : le pion avancé
  est perdu quelle que soit la défense) ;
- **Tiphaine** 😜 — *le taquin* : l'avant-poste en 24 qui cloue les pions
  15 et 25 au bord… et mord par prise majoritaire quand on le chasse ;
- **Boris** 🪵 — *le marchand de bois* : les formations de pionage (Y,
  croix, flèche, triplet) et le Y du bord à la menace imparable ;
- **Hortense** 🏁 — *l'école des finales* : l'offre + la double opposition
  (3 pions contre 2), puis le célèbre **blocage angulaire** (dame contre
  deux pions), sur des lignes de traités re-certifiées par le moteur.

La table d'entraînement du club gagne aussi deux exercices de finales :
**la règle de la 4e rangée** (trois temps d'avance + le trait) et **le
tric-trac** (blocage de la dame sur la diagonale 6-45). Thèmes issus des
méthodes classiques de fins de partie (« Allons à dame » de J-F. Latapie,
traités FFJD/FMJD) — texte original, positions revérifiées.

### 🌟 L'Annexe des maîtres (réservée aux diplômés)

Le **diplôme de l'Académie** (les 6 leçons) débloque une petite salle sur
le campus où deux maîtres enseignent des systèmes de niveau championnat,
d'après les ouvrages interactifs de J-P. Dubois (champion de France 1982)
diffusés gratuitement par « Allons à dame » :

- **Piet** 🌷 — *le système Roozenburg* (champion du monde 1948-1956) :
  l'échange d'installation 30-24/35x24, le taquin épaulé, la pression sur
  le pion central isolé… et la punition de la défense 17-22 par la
  formation 33-39-44 (gain certifié) ;
- **Sacha** ❄️ — *le système Keller, variante Chizhov* : la ligne complète
  d'une partie de championnat du monde (Boomstra–Ivanov, 2013) rejouée
  coup par coup, jusqu'à la structure à avant-poste 24.

Chaque système se conclut par une partie d'application de niveau
« Champion régional ».

### 🕯️ Les études d'Hortense et la Woldouby

Après sa leçon, Hortense sort son **cahier d'études** : 12 positions de
fins de partie tirées des cours « Allons à dame », certifiées en mode
étude — **un seul coup gagne** (le moteur vérifie que le coup unique mène
à une évaluation gagnante et que TOUS les autres coups laissent la nulle).
Les 12 études résolues offrent les pions exclusifs « Ivoire & ébène ».

Au club, l'Arbitre propose enfin de rejouer une **position d'anthologie** :
la **Woldouby** (Paris, ~1910), 10 pions contre 10, l'équilibre au rasoir
(le moteur la donne à −3). La vaincre avec les Blancs rapporte 200 Pions
d'Or.

Chaque leçon se joue sur le vrai moteur (coups commentés, répliques
scriptées), puis le professeur propose une **partie d'application** dans la
structure étudiée. Les cinq leçons donnent le **diplôme de l'Académie** :
prime de Pions d'Or et damier exclusif « L'Ardoise du professeur ».
`tests/academy.test.mjs` rejoue chaque leçon et re-certifie les menaces
« imparables » à chaque `npm test`.

## 📚 La bibliothèque du club

L'étagère du club (à côté du tableau noir) ouvre la bibliothèque : **huit
parties de maîtres à rejouer coup par coup** — Korchov–Kouperman (URSS
1955), Sijbrands–Varkevisser (1967), Zalitis–Gantwarg, Chizhov–Clerc
(Leeuwarden 1998), Boomstra–Schotanus, Shchegolev–Kolodiev, etc. Les coups
sont des faits historiques extraits du corpus « Allons à dame » et
**revérifiés par le moteur** (`tests/games.test.mjs` rejoue chaque partie
intégralement) ; les annotations (rafles, promotions, bascules
d'évaluation, fiches d'introduction) sont originales. Première lecture
complète d'une partie : +40 Pions d'Or.

Chaque partie se joue aussi en mode **🎯 Devine le coup du maître** : tu
joues le camp du champion (Kouperman, Sijbrands, Chizhov, Boomstra…) et
tu dois retrouver chacun de ses coups. Coup exact ✅ (4 Pions d'Or),
coup différent mais jugé équivalent par le moteur 👍 (2), raté ❌ — la
partie est ensuite remise sur les rails du maître. Score, étoiles et
récompense à la première tentative de chaque partie.

## 📖 Le Carnet du damiste

Accessible depuis le menu et depuis le monde (bouton 📖 en haut à droite),
le Carnet récapitule TOUTE la progression — aventure, leçons de Gigi,
Académie et Annexe, séries d'énigmes, études, compétitions, Woldouby,
trésors secrets — et indique **où aller** pour chaque activité. Les
contenus non découverts restent affichés en « ??? » avec un indice,
sans divulgâcher.

## 🧠 Architecture

```
index.html, css/          coque responsive (PC + mobile)
vendor/draughts.js        moteur de RÈGLES vendorisé (@jortvl/draughts, MPL-2.0)
src/engine/rules.js       RulesEngine : façade propre et REMPLAÇABLE du moteur
src/ai/                   IA maison : minimax alpha-bêta (search.js),
                          évaluation (evaluate.js), niveaux (levels.js),
                          Web Worker (worker.js) + façade (player.js)
src/game/                 damier canvas (boardview.js) + contrôleur de partie (match.js)
src/world/                overworld : cartes, moteur, PNJ, portraits, dialogues
src/story/                scénario (quests.js), tutoriel (tutorial.js),
                          entraînement (training.js), énigmes PNJ (combos.js),
                          Académie des styles (academy.js)
src/career/               Elo, adversaires, compétitions
src/shop/                 thèmes cosmétiques + boutique
src/audio/                musiques génératives + effets (Web Audio, zéro asset)
src/save/                 état du jeu + sauvegarde localStorage
tests/                    tests node du moteur de règles et de l'IA
```

Points d'architecture :

- **Moteur de règles réutilisé, pas réécrit** : la génération/validation des
  coups vient de la bibliothèque `@jortvl/draughts` ; le jeu ne lui parle
  qu'à travers `RulesEngine`, donc elle est remplaçable.
- **IA codée maison** (exigence du projet) : négamax + élagage alpha-bêta,
  approfondissement itératif borné dans le temps, extension des rafles,
  bruit d'évaluation et probabilité de gaffe réglables → niveaux nommés du
  Débutant au Grand maître. Le calcul tourne dans un **Web Worker** :
  l'interface ne gèle jamais, même sur mobile.
- **La force des adversaires suit un Elo** : chaque victoire fait monter ton
  classement (et un peu celui de l'adversaire battu) ; les paramètres de
  l'IA (profondeur, temps, bruit, gaffes) sont dérivés de l'Elo effectif.

## 📦 Bibliothèques et licences

| Composant | Origine | Licence |
|---|---|---|
| `vendor/draughts.js` (moteur de règles 10×10) | [@jortvl/draughts](https://www.npmjs.com/package/@jortvl/draughts) v0.4.2, fork maintenu de [draughts.js](https://github.com/shubhendusaurabh/draughts.js) | **MPL-2.0** |
| Tout le reste (jeu, IA, monde, UI, audio) | code original du projet | **MIT** |

⚠️ **Note licence** : il n'existe pas, à notre connaissance, de bibliothèque
JavaScript de dames internationales 10×10 sous licence MIT (`draughts.js` et
son fork sont en MPL-2.0 ; `rapid-draughts`, MIT, ne couvre que le 8×8
anglais ; `draughts-reader-core` n'a pas de licence déclarée). La MPL-2.0
n'est **pas** la GPL : c'est un copyleft *faible limité au fichier*, sans
effet sur le reste du projet. Le fichier est repris à l'identique (plus un
export ESM de 3 lignes), avec sa licence dans `vendor/LICENSE-MPL-2.0.txt` ;
détails et procédure de remplacement dans `vendor/README.md`.

Aucune dépendance npm d'exécution : pas de `node_modules`, pas de build.

## 🎨 Assets

**Tous les visuels et tous les sons sont générés par le code** (canvas 2D et
Web Audio) : il n'y a aucun fichier image ou audio à télécharger, donc aucune
question de droits. Pour les remplacer par de « vrais » assets :

- **Graphismes** : les tuiles/props se dessinent dans
  `src/world/overworld.js` (`_drawProp`, `TILE_COLORS`), les personnages dans
  `src/world/portraits.js`, les pièces dans `src/game/boardview.js`
  (`drawPiece`) — remplacer ces fonctions par des `drawImage()` de
  spritesheets.
- **Musique/SFX** : remplacer `playMusic`/`playSfx` dans
  `src/audio/audio.js` par la lecture de fichiers (les points d'appel et les
  noms de pistes — menu, village, club, match, tournament — restent valides).

## 🧪 Tests

```bash
npm test    # règles (13 tests, dont rafle majoritaire) + IA (6 tests)
```
