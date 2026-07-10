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

export const COURSES = {
  classique: CLASSIQUE,
};

export function courseForStyle(styleId) {
  return COURSES[styleId] || null;
}
