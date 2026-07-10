/**
 * LES COURS COMPLETS DE L'ACADÉMIE — chaque style a désormais un cours à
 * chapitres qui enseigne les VRAIS plans : idées directrices, cases clés,
 * manœuvres types, combinaisons caractéristiques et pièges.
 *
 * Contenu original (rédigé pour DraughtsQuest) ; positions et lignes issues
 * des grands systèmes, toutes revérifiées par le moteur (tests/course.test.mjs).
 * Voir src/story/course.js pour le format d'un chapitre.
 */

const START = 'W:W31-50:B1-20';

// ===========================================================================
// LA PARTIE CLASSIQUE — d'après les « six piliers » du système (J-P. Dubois).
// ===========================================================================
const CLASSIQUE = {
  id: 'classique',
  npc: 'celestin',
  title: 'Cours complet : la partie classique',
  reward: 150,
  chapters: [
    {
      title: 'Les deux camps',
      fen: START,
      say: [
        { who: 'celestin', text: 'La partie CLASSIQUE est la mère de tous les styles. Son principe : les deux camps se partagent le centre et s\'y accrochent par un enchaînement réciproque. Tout se joue sur quelques cases.' },
        { who: 'celestin', text: 'Tes cases clés, à toi les Blancs : 28, puis 27 et 29 pour l\'encadrer. Les siennes, en miroir : 23, 22 et 24. Celui qui tient le mieux ces cases-là dicte la partie.' },
      ],
      show: [
        { mv: '32-28', note: 'Le coup d\'ouverture roi : on plante le drapeau au centre, en 28.' },
        { mv: '18-23', note: 'Réponse symétrique des Noirs. Les deux pions de pointe se regardent en chiens de faïence : la partie classique est née.' },
      ],
    },
    {
      title: 'Pilier 1 — Le contrôle des ailes',
      fen: START,
      say: [
        { who: 'celestin', text: 'Premier pilier : le CONTRÔLE DES AILES. L\'idée, venue du Hollandais Lochtenberg, est de tenir les DEUX flancs pour forcer l\'adversaire à s\'affaiblir sur l\'un d\'eux — et percer là.' },
        { who: 'celestin', text: 'Regarde la manœuvre d\'ouverture qui prépare ce plan.' },
      ],
      show: [
        { mv: '31-27', note: '31-27 : on renforce l\'aile droite avant même de disputer le centre.' },
        { mv: '19-23' },
        { mv: '33-28', note: '33-28 : le centre est tenu, les deux ailes respirent. Les Blancs pourront désormais choisir leur flanc d\'attaque.' },
      ],
    },
    {
      title: 'Pilier 4 — Le grand triangle latéral',
      fen: 'W:W25,27,28,30,32,33,34,35,36,37,38,40,42,45,47,48:B1,3,6,8,9,11,13,14,15,16,18,19,21,23,24,26',
      say: [
        { who: 'celestin', text: 'Voici une structure que tout classique doit reconnaître : le GRAND TRIANGLE LATÉRAL, les six pions 25-30-34-35-40-45. Une forteresse mobile qui pèse sur l\'aile gauche adverse.' },
        { who: 'celestin', text: 'Sa menace permanente : l\'échange 34-29, qui déforme le camp noir. Regarde-la se dérouler.' },
      ],
      show: [
        { mv: '34-29', note: '34-29 : on frappe le pion 23.' },
        { mv: '23x34' },
        { mv: '40x20', note: '40x20 : la reprise majoritaire balaie deux pions au passage.' },
        { mv: '15x24', note: 'Bilan : le camp noir est déformé, son aile gauche à découvert. Voilà le triangle à l\'œuvre.' },
      ],
    },
    {
      title: 'Pilier 3 — Seuls au centre',
      fen: 'W:W27,28,32,33,34,35,37,38,40,45:B9,12,13,14,16,18,19,23,24,26',
      say: [
        { who: 'celestin', text: 'Troisième pilier : SEULS AU CENTRE. Le but est radical — déloger DÉFINITIVEMENT l\'adversaire du centre, pour y rester maître unique.' },
        { who: 'celestin', text: 'Le levier est le même que pour le triangle : l\'échange 34-29. À TOI de le trouver — c\'est le coup qui éventre le centre noir.' },
      ],
      drill: {
        ask: [{ who: 'celestin', text: 'Les Blancs jouent. Quel coup élimine les pions centraux adverses ?' }],
        accept: [{ from: 34, to: 29 }],
        reply: { from: 23, to: 34 },
        wrong: { who: 'celestin', text: 'Non. Cherche l\'ÉCHANGE au centre : le coup qui met un pion au contact du pion noir 23 et le force à te suivre.' },
        hint: { from: 34, to: 29 },
        then: [
          { mv: '40x20' },
          { mv: '14x25' },
        ],
        success: [
          { who: 'celestin', text: '34-29, 23x34, 40x20, 14x25 ! Compte : les Noirs n\'ont plus un seul pion au centre. Te voilà SEUL au centre — la partie t\'appartient.' },
        ],
      },
    },
    {
      title: 'Pilier 2 — La menace du coup royal',
      fen: 'W:W34,40,45:B12,13,14',
      say: [
        { who: 'celestin', text: 'Deuxième pilier : LA MENACE DU COUP ROYAL. Les Russes appellent 45-40 la « formation olympique ». Ajoute le pion 34 et tu obtiens la FLÈCHE 45-40-34, une colonne de choc.' },
        { who: 'celestin', text: 'Cette flèche menace en permanence le coup royal — un sacrifice qui force l\'adversaire à prendre plusieurs pions… avant que tu ne raffles tout. Rien que la MENACE force souvent une concession.' },
      ],
      show: [
        { mv: '34-29', note: 'La pointe de la flèche s\'avance : 34-29. Toute la structure pousse vers le camp adverse.' },
      ],
    },
    {
      title: 'Le coup royal en action',
      fen: 'W:W31,35,36,37,45,48:B7,8,10,17,19,23,38',
      say: [
        { who: 'celestin', text: 'Assez de théorie : voici le coup royal POUR DE VRAI. Les Blancs jouent et gagnent. Le premier coup a l\'air d\'un cadeau… c\'en est un empoisonné.' },
      ],
      drill: {
        ask: [{ who: 'celestin', text: 'Trouve le sacrifice qui déclenche tout. (Souviens-toi : s\'il PEUT prendre, il DOIT prendre.)' }],
        accept: [{ from: 37, to: 32 }],
        reply: { from: 38, to: 27 },
        wrong: { who: 'celestin', text: 'Cherche le coup qui met un pion EN PRISE de telle façon que la reprise noire s\'aligne sous ta grande rafle.' },
        hint: { from: 37, to: 32 },
        then: [
          { mv: '31-24' },
        ],
        success: [
          { who: 'celestin', text: '37-32 ! 38x27 forcé… et 31x24 rafle CINQ pions d\'un coup. Voilà le coup royal : on donne un, on prend tout. La terreur de la partie classique.' },
        ],
      },
    },
    {
      title: 'Pilier 6 — Le jeu offensif sur l\'aile gauche',
      fen: 'W:W25,27,28,30,31,32,35,36,38,39,43,48,49,50:B3,5,6,8,9,12,13,14,15,16,18,19,23,24',
      say: [
        { who: 'celestin', text: 'Sixième pilier, le plus moderne : le JEU OFFENSIF SUR L\'AILE GAUCHE. Des temps d\'avance ne servent à rien s\'ils dorment ; il faut les convertir en ATTAQUE.' },
        { who: 'celestin', text: 'La méthode de Sijbrands : d\'abord VERROUILLER l\'aile droite adverse, puis déferler à gauche. Observe le verrou.' },
      ],
      show: [
        { mv: '39-33', note: '39-33 ! Avant toute attaque, on verrouille la sortie du pion noir 24 sur la case 29.' },
        { mv: '24-29' },
        { mv: '33x24' },
        { mv: '14-20', note: 'L\'aile droite noire est figée. Les Blancs ont désormais les mains libres pour attaquer l\'autre flanc.' },
      ],
    },
    {
      title: 'Apprendre à désapprendre',
      fen: START,
      say: [
        { who: 'celestin', text: 'Un dernier secret, et non des moindres. Pendant un siècle, on a cru qu\'une partie classique se gagnait avec des TEMPS DE RETARD — en immobilisant l\'adversaire.' },
        { who: 'celestin', text: 'Puis vint Baba Sy, de Dakar, qui gagnait au contraire avec des temps d\'AVANCE, en attaquant. Chizhov a parachevé cette révolution. La leçon : méfie-toi des dogmes, compte les temps, mais surtout… JOUE.' },
        { who: 'celestin', text: 'Voilà les six piliers : contrôle des ailes, coup royal, seuls au centre, grand triangle, avancée Ghestem, jeu offensif à gauche. Tu ne regarderas plus jamais une partie classique de la même façon.' },
      ],
    },
  ],
};

// ===========================================================================
// LE PION TAQUIN — l'avant-poste en 24 et le taquin adverse isolé.
// ===========================================================================
const TAQUIN = {
  id: 'taquin',
  npc: 'tiphaine',
  title: 'Cours complet : le pion taquin',
  reward: 130,
  chapters: [
    {
      title: 'L\'avant-poste et son gardien',
      fen: 'W:W29,30,33,34,39,40,44,45:B4,5,10,14,15,18,19,25',
      say: [
        { who: 'tiphaine', text: 'Le TAQUIN, c\'est le pion qu\'on plante en 24, en plein dans l\'aile adverse. Sa mission : clouer les pions du bord — ici 15 et 25 — et gêner tout le monde.' },
        { who: 'tiphaine', text: 'Sa règle d\'or : jamais seul ! Il lui faut un GARDIEN. Regarde : ton pion 30 protège la case 24. Sans lui, le taquin se fait cueillir.' },
      ],
      show: [
        { mv: '29-24', note: '29-24 : l\'avant-poste est en place, gardé par le 30. Les pions noirs 15 et 25 sont désormais paralysés au bord.' },
      ],
    },
    {
      title: 'Le taquin isolé de l\'adversaire',
      fen: 'W:W26,28,33,34,35,36,37,38,39,43,49:B7,8,9,10,11,12,13,14,15,25,27',
      say: [
        { who: 'tiphaine', text: 'Le plus beau, c\'est quand c\'est LUI qui a un taquin… mal entouré. Son pion 27 est ISOLÉ, cerné par tes pions. Et ta flèche 28-33-39 lui interdit la case 19 : impossible de reprendre pied au centre.' },
        { who: 'tiphaine', text: 'Résultat : les Noirs sont condamnés à jouer sur les côtés et à subir. Regarde comme tu déroules ton jeu tranquillement.' },
      ],
      show: [
        { mv: '34-29', note: '34-29 : on avance, sans hâte.' },
        { mv: '14-20' },
        { mv: '39-34', note: '39-34 : la flèche se reforme un cran plus haut. Le pion 27 reste prisonnier.' },
        { mv: '20-24' },
        { mv: '29x20' },
        { mv: '15x24' },
        { mv: '43-39', note: 'Et ça recommence. Les Noirs n\'ont aucun contre-jeu : voilà la puissance d\'un taquin isolé bien encerclé.' },
      ],
    },
    {
      title: 'La combinaison du taquin',
      fen: 'W:W21,27,30,34,37:B12,16,19,20,26,28',
      say: [
        { who: 'tiphaine', text: 'Et quand l\'adversaire s\'énerve autour de ton avant-poste… il tombe dans le piège. Les Blancs jouent et gagnent un pion par une combinaison typique du taquin.' },
        { who: 'tiphaine', text: 'Le mécanisme est toujours le même : un petit sacrifice qui aligne les pions adverses, puis une rafle qui ramasse la mise. Ouvre l\'œil !' },
      ],
      drill: {
        ask: [{ who: 'tiphaine', text: 'Trouve le coup calme qui déclenche tout. Indice : offre en douceur, la reprise est obligatoire.' }],
        accept: [{ from: 30, to: 25 }],
        reply: { from: 26, to: 17 },
        wrong: { who: 'tiphaine', text: 'Non — cherche le coup discret qui met un pion en prise pour que la reprise noire s\'aligne sous ta rafle.' },
        hint: { from: 30, to: 25 },
        then: [{ mv: '25-32' }],
        success: [
          { who: 'tiphaine', text: '30-25, 26x17, 25x32 : trois pions raflés, un pion de gain net ! Le taquin ne se contente pas de gêner — il MORD.' },
        ],
      },
    },
    {
      title: 'Quand échanger le taquin ?',
      fen: 'W:W26,28,33,34,35,36,37,38,39,43,49:B7,8,9,10,11,12,13,14,15,25,27',
      say: [
        { who: 'tiphaine', text: 'Dernière sagesse : l\'échange du taquin est TOUJOURS possible… mais rarement pressé. Tant que ton avant-poste étouffe l\'adversaire, garde-le ! On n\'échange que pour transformer l\'avantage en gain concret.' },
        { who: 'tiphaine', text: 'Retiens : un taquin GARDÉ, un adversaire CLOUÉ, une flèche qui interdit le centre… et de la patience. Le reste vient tout seul.' },
      ],
    },
  ],
};

// ===========================================================================
// LA PARTIE SEMI-OUVERTE — le « half-open klassiek » et l'enchaînement à 29.
// ===========================================================================
const SEMIOUVERTE = {
  id: 'semiouverte',
  npc: 'salome',
  title: 'Cours complet : la partie semi-ouverte',
  reward: 140,
  chapters: [
    {
      title: 'Qu\'est-ce que la semi-ouverte ?',
      fen: START,
      say: [
        { who: 'salome', text: 'La partie SEMI-OUVERTE — « half-open klassiek » chez les Hollandais — est la cousine de la classique. Un seul camp tient vraiment le centre ; l\'autre joue AUTOUR, plus souplement.' },
        { who: 'salome', text: 'Elle naît d\'un schéma reconnaissable : 32-28 et, en face, 20-24. Regarde la prise de contact caractéristique.' },
      ],
      show: [
        { mv: '32-28' },
        { mv: '20-24', note: 'Le pion noir 24 s\'écarte du centre : signature de la semi-ouverte.' },
        { mv: '34-30', note: '34-30 : les Blancs préparent l\'échange latéral.' },
        { mv: '18-23' },
        { mv: '30-25' },
        { mv: '23x32' },
        { mv: '37x28', note: 'La position est prise : structures asymétriques, jeu tout en manœuvres. Bienvenue en semi-ouverte.' },
      ],
    },
    {
      title: 'L\'enchaînement du pion central à 29',
      fen: 'W:W27,30,32,33,34,37,38:B13,14,16,18,19,23,26',
      say: [
        { who: 'salome', text: 'La grande arme de la semi-ouverte : l\'ENCHAÎNEMENT à 29. On cloue le pion central adverse (ici le 23) et, derrière, plane la menace 27-22.' },
        { who: 'salome', text: 'À toi : trouve le coup qui enchaîne le pion 23 et met les Noirs sans solution.' },
      ],
      drill: {
        ask: [{ who: 'salome', text: 'Les Blancs jouent. Quel coup enchaîne le pion central 23 ?' }],
        accept: [{ from: 33, to: 29 }],
        wrong: { who: 'salome', text: 'Cherche le coup qui vient border le pion 23 par en dessous, en installant un pion en 29 — et qui prépare la menace 27-22.' },
        hint: { from: 33, to: 29 },
        success: [
          { who: 'salome', text: '33-29 ! Le pion 23 est enchaîné, et la menace 27-22 pèse de tout son poids. Les Noirs vont devoir concéder. C\'est LA position que les maîtres cherchent en semi-ouverte.' },
        ],
      },
    },
    {
      title: 'L\'art de l\'encerclement',
      fen: 'W:W34,36,37,38,39:B8,12,17,18,28',
      say: [
        { who: 'salome', text: 'Et quand l\'adversaire pousse un pion trop loin dans ton camp ? La réponse semi-ouverte n\'est jamais l\'attaque frontale : c\'est l\'ENCERCLEMENT. Prive-le de ses cases de fuite, une à une.' },
        { who: 'salome', text: 'Regarde le pion noir avancé en 28 : au lieu de foncer dessus, on referme la nasse.' },
      ],
      show: [
        { mv: '34-29', note: '34-29 : toutes les cases de fuite du pion 28 sont désormais surveillées. Il est condamné.' },
      ],
    },
    {
      title: 'La philosophie du style',
      fen: START,
      say: [
        { who: 'salome', text: 'Retiens l\'esprit semi-ouvert : de la SOUPLESSE. On n\'occupe pas le centre à tout prix ; on le contourne, on l\'encercle, on enchaîne. La patience du chat, pas la fougue du taureau.' },
        { who: 'salome', text: 'Prise de contact, enchaînement à 29, menace 27-22, encerclement des pions avancés : voilà ta boîte à outils. Le centre adverse n\'est plus une menace — c\'est ton futur prisonnier.' },
      ],
    },
  ],
};

export const COURSES = {
  classique: CLASSIQUE,
  taquin: TAQUIN,
  semiouverte: SEMIOUVERTE,
};

export function courseForStyle(styleId) {
  return COURSES[styleId] || null;
}
