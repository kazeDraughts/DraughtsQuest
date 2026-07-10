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

// ===========================================================================
// LE SYSTÈME GHESTEM — gagner de l'espace par l'avancée, puis bloquer.
// ===========================================================================
const GHESTEM = {
  id: 'ghestem',
  npc: 'gaspard',
  title: 'Cours complet : le système Ghestem',
  reward: 140,
  chapters: [
    {
      title: 'Gagner de l\'espace',
      fen: 'W:W27,28,32,33,34,38,39,43,44,49:B3,4,8,9,13,14,18,19,20,23',
      say: [
        { who: 'gaspard', text: 'Pierre Ghestem, champion du monde français, a donné son nom à une idée simple et redoutable : GAGNER DE L\'ESPACE dans le camp adverse, et l\'y étouffer.' },
        { who: 'gaspard', text: 'L\'arme du système : l\'avancée 28-22, PROTÉGÉE par ton pion 27. Impossible à prendre, elle plante ton drapeau chez l\'ennemi. À toi de la jouer !' },
      ],
      drill: {
        ask: [{ who: 'gaspard', text: 'Les Blancs jouent. Trouve l\'avancée qui gagne de l\'espace sans se faire prendre.' }],
        accept: [{ from: 28, to: 22 }],
        reply: { from: 20, to: 24 },
        wrong: { who: 'gaspard', text: 'Non : L\'AVANCÉE. Le pion 28 plonge en 22, dans leur camp — et ton pion 27 le garde. Aucune prise possible pour eux.' },
        hint: { from: 28, to: 22 },
        then: [{ mv: '33-28' }],
        success: [
          { who: 'gaspard', text: '28-22 ! Puis 33-28 pour reconstruire le mur. Tes pions 22 et 28 verrouillent tout un secteur : l\'aile gauche adverse suffoque. Voilà l\'étau Ghestem.' },
        ],
      },
    },
    {
      title: 'L\'avancée en fin de milieu',
      fen: 'W:W27,28,30,32,33,34,35,37,38,43:B8,13,14,16,18,19,21,23,24,26',
      say: [
        { who: 'gaspard', text: 'L\'avancée Ghestem prend toute sa valeur en FIN DE MILIEU, face à un « trèfle » adverse (ces trois pions groupés). Mais attention : chaque coup doit être calculé.' },
        { who: 'gaspard', text: 'Ici, un jeu tranquille mène tout droit à une structure d\'équilibre célèbre — la position Woldouby. Regarde.' },
      ],
      show: [
        { mv: '43-39', note: '43-39 : on renforce l\'arrière avant d\'agir.' },
        { mv: '8-12' },
        { mv: '30-25' },
        { mv: '12-17' },
        { mv: '34-30', note: '34-30 : et voilà la position Woldouby, cet équilibre au rasoir que même les champions peinent à briser. Savoir RECONNAÎTRE ces structures, c\'est déjà être fort.' },
      ],
    },
    {
      title: 'La relève des pions',
      fen: 'W:W22,27,28,32,34,38,39,43,44,49:B3,4,8,9,13,14,18,19,23,24',
      say: [
        { who: 'gaspard', text: 'Un système d\'étau ne tient que si chaque pion avancé a sa RELÈVE. Tes pions 22 et 28 pèsent sur l\'ennemi ; derrière, la colonne 44-39-34 doit être prête à monter les remplacer.' },
        { who: 'gaspard', text: 'Regarde ta position : de l\'espace, des colonnes, des temps de réserve. En face, des pions qui se marchent dessus. L\'étau ne se desserrera jamais tout seul — c\'est à toi de le maintenir, patiemment.' },
      ],
      show: [
        { mv: '44-40', note: '44-40 : l\'arrière-garde monte. Chaque pion avancé sait qu\'un camarade le relèvera. C\'est ça, un étau qui dure.' },
      ],
    },
    {
      title: 'Bloquer tous les pions',
      fen: 'W:W27,28,32,33,34,38,39,43,44,49:B3,4,8,9,13,14,18,19,20,23',
      say: [
        { who: 'gaspard', text: 'La devise du maître Dubois pour ce système : « bloquer TOUS les pions adverses ». Un pion bloqué ne joue plus ; s\'ils le sont tous, l\'adversaire est perdu même à matériel égal.' },
        { who: 'gaspard', text: 'Mais retiens l\'avertissement : quand c\'est TOI qu\'on enchaîne, ne subis pas. Rends ton jeu actif, cherche un objectif précis — un gambit, une percée. Sinon, c\'est toi qu\'on étouffe.' },
      ],
    },
  ],
};

// ===========================================================================
// LE MARCHAND DE BOIS — les enchaînements, la tenaille, les formations.
// ===========================================================================
const BOIS = {
  id: 'bois',
  npc: 'boris',
  title: 'Cours complet : le marchand de bois',
  reward: 140,
  chapters: [
    {
      title: 'Le charpentier et ses formations',
      fen: START,
      say: [
        { who: 'boris', text: 'Chez moi, on ne pousse pas des pions : on monte des CHARPENTES. Les formations de pionage — le Y, la croix, la flèche, le triplet — sont les poutres du jeu de dames.' },
        { who: 'boris', text: 'Et ma spécialité, le MARCHAND DE BOIS : un Y construit au bord du damier, une pile de pions qui immobilise tout un pan du camp adverse. On l\'appelle aussi un ENCHAÎNEMENT.' },
      ],
      show: [
        { mv: '33-28', note: '33-28 : la pointe d\'une flèche. Chaque formation naît d\'un coup simple — mais pensé comme une charpente.' },
      ],
    },
    {
      title: 'L\'enchaînement latéral : la tenaille',
      fen: 'W:W27,28,31,33:B16,17,18,22',
      say: [
        { who: 'boris', text: 'Le plus redoutable des enchaînements porte un nom qui fait peur : la TENAILLE. Regarde cette forme — tes pions 27-28 prennent le pion noir 22 en étau, et le 31-33 verrouille derrière.' },
        { who: 'boris', text: 'Un pion pris en tenaille ne peut plus bouger sans tomber. C\'est le rêve du charpentier : l\'adversaire cloué, et toi libre d\'agir ailleurs.' },
      ],
    },
    {
      title: 'La tenaille de Baba Sy',
      fen: 'W:W26,28,31,32,33,36,40,42,45,49:B6,7,8,9,12,14,16,17,18,22',
      say: [
        { who: 'boris', text: 'Voici la tenaille dans une vraie partie — Baba Sy, le magicien de Dakar, contre Mulder, 1963. Les Blancs jouent un coup tranquille après lequel les Noirs n\'ont PLUS AUCUNE PARADE.' },
      ],
      drill: {
        ask: [{ who: 'boris', text: 'Trouve le coup qui installe la tenaille et crée une menace imparable.' }],
        accept: [{ from: 32, to: 27 }],
        wrong: { who: 'boris', text: 'Cherche le coup qui referme la tenaille sur le pion 22 et prépare l\'irruption 27-21.' },
        hint: { from: 32, to: 27 },
        success: [
          { who: 'boris', text: '32-27 ! La menace 27-21 est imparable : quoi que jouent les Noirs, ils perdent du bois. Baba Sy raflait ensuite cinq pions d\'un coup. Voilà pourquoi on craignait ce joueur.' },
        ],
      },
    },
    {
      title: 'La stratégie EN FACE du marchand',
      fen: 'W:W26,27,29,31,33,36,38,42,47:B6,12,16,17,18,19,22',
      say: [
        { who: 'boris', text: 'Un bon charpentier sait aussi COMBATTRE un enchaînement adverse. Quand l\'ennemi a un pion en 29, toute sa diagonale 47-29 est immobilisée — c\'est une entrave autant qu\'une force.' },
        { who: 'boris', text: 'La parade : jouer sur l\'aile LIBRE, là où l\'adversaire a dégarni pour tenir sa charpente. On ne détruit pas la tenaille de front — on la contourne, et on frappe où elle a laissé un trou.' },
      ],
    },
    {
      title: 'Charpente et patience',
      fen: START,
      say: [
        { who: 'boris', text: 'Voilà mon métier résumé : des FORMATIONS solides (Y, croix, flèche, triplet), l\'ENCHAÎNEMENT qui cloue (le marchand de bois, la tenaille), et la PATIENCE de laisser l\'adversaire scier lui-même la branche où il est assis.' },
        { who: 'boris', text: 'Du bois bien empilé ne s\'écroule jamais. Monte tes charpentes, petit, et le damier t\'appartiendra.' },
      ],
    },
  ],
};

// ===========================================================================
// LES FINALES — compter les temps, l'opposition, le blocage angulaire.
// ===========================================================================
const FINALES = {
  id: 'finales',
  npc: 'hortense',
  title: 'Cours complet : les finales',
  reward: 140,
  chapters: [
    {
      title: 'Les finales se comptent',
      fen: 'W:W17:B19',
      say: [
        { who: 'hortense', text: 'Assieds-toi, mon petit. En finale, presque plus de pions sur le damier — et pourtant, c\'est là que les parties se GAGNENT ou se perdent. Le secret ? On ne compte plus les pions, on compte les TEMPS et les CASES.' },
        { who: 'hortense', text: 'Un temps, c\'est un coup d\'avance dans la course à la promotion. Souvent, un seul temps décide de tout. Apprends à les compter avant de te lancer.' },
      ],
    },
    {
      title: 'L\'opposition',
      fen: 'W:W32:B18',
      say: [
        { who: 'hortense', text: 'Le duel le plus pur : un pion contre un pion. Ici, pas de combinaison — une affaire de CASES. Il existe un coup après lequel le pion noir est perdu quoi qu\'il fasse.' },
        { who: 'hortense', text: 'On appelle ça le ZUGZWANG : « l\'obligation de jouer ». L\'adversaire doit bouger… et tout coup le condamne. Mais attention : une seule de tes deux avances gagne !' },
      ],
    },
    {
      title: 'Trouver le zugzwang',
      fen: 'W:W32:B18',
      say: [
        { who: 'hortense', text: 'À toi. Regarde les cases où le pion noir POURRA aller après ton coup… et choisis l\'avance qui les met TOUTES sous ta prise.' },
      ],
      drill: {
        ask: [{ who: 'hortense', text: 'Une seule avance gagne. Laquelle ?' }],
        accept: [{ from: 32, to: 28 }],
        reply: { from: 18, to: 22 },
        wrong: { who: 'hortense', text: 'Nulle ! Par là, le pion noir garde une case de fuite. Reprends : après ton coup, ses DEUX avances doivent tomber sous ta prise.' },
        hint: { from: 32, to: 28 },
        then: [{ mv: '28-17' }],
        success: [
          { who: 'hortense', text: '32-28 ! Le pion noir n\'a que 22 et 23 — toutes deux sous ta prise. Il joue, forcé, 18-22… et 28x17 : le damier est à toi. Voilà le zugzwang.' },
        ],
      },
    },
    {
      title: 'La règle de la 4e rangée',
      fen: 'W:W17:B19',
      say: [
        { who: 'hortense', text: 'Un classique à connaître par cœur : les deux pions sur leur 4e rangée, face à face. Avec le TRAIT, les Blancs gagnent ; sans lui, c\'est nulle. Trois temps d\'avance plus le trait suffisent à damer le premier ET à bloquer le pion adverse.' },
        { who: 'hortense', text: 'La méthode : foncer tout droit vers la promotion, puis placer sa dame toute neuve sur la diagonale d\'interception. Jamais de zigzag : chaque coup doit rapprocher du but.' },
      ],
    },
    {
      title: 'Dame contre deux pions',
      fen: 'W:WK23:B11,20',
      say: [
        { who: 'hortense', text: 'Et la reine des finales : DAME CONTRE DEUX PIONS. Beaucoup croient que la dame gagne seule. Faux ! Sans méthode, les pions passent. Il faut le BLOCAGE ANGULAIRE.' },
        { who: 'hortense', text: 'Le principe : conduire ta dame dans le COIN vers lequel courent les pions — case 48 ou 49 — et les y attendre. Plus ils avancent, plus ils marchent vers leur cage. Retiens mes trois secrets : les temps avant les pions, l\'offre qui déplace, et le coin qui attend.' },
      ],
    },
  ],
};

export const COURSES = {
  classique: CLASSIQUE,
  taquin: TAQUIN,
  semiouverte: SEMIOUVERTE,
  ghestem: GHESTEM,
  bois: BOIS,
  finales: FINALES,
};

export function courseForStyle(styleId) {
  return COURSES[styleId] || null;
}
