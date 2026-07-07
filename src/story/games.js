/**
 * LA BIBLIOTHÈQUE DU CLUB — huit parties de maîtres à rejouer coup par coup.
 * Les COUPS sont des faits historiques (parties publiques, corpus
 * « Allons à dame ») ; les annotations sont originales, calculées par
 * notre moteur (rafles, promotions, bascules d'évaluation) et rédigées
 * pour DraughtsQuest. Rejouées par tests/games.test.mjs.
 * moves: [{ from, to, takes, promo }], notes: { indexDuCoup: texte }.
 */

export const GAMES = [
 {
  id: "korchov1955",
  guessSide: "b",
  white: "Michael Korchov",
  black: "Iser Kouperman",
  event: "Championnat d'URSS, 1955",
  theme: "Système classique",
  intro: "Un duel de légendes soviétiques : Kouperman fut sept fois champion du monde. Observe comment chaque camp construit ses colonnes avant de disputer le centre.",
  moves: [
   {
    from: 32,
    to: 28,
    takes: 0,
    promo: false
   },
   {
    from: 19,
    to: 23,
    takes: 0,
    promo: false
   },
   {
    from: 28,
    to: 19,
    takes: 1,
    promo: false
   },
   {
    from: 14,
    to: 23,
    takes: 1,
    promo: false
   },
   {
    from: 33,
    to: 28,
    takes: 0,
    promo: false
   },
   {
    from: 23,
    to: 32,
    takes: 1,
    promo: false
   },
   {
    from: 37,
    to: 28,
    takes: 1,
    promo: false
   },
   {
    from: 10,
    to: 14,
    takes: 0,
    promo: false
   },
   {
    from: 41,
    to: 37,
    takes: 0,
    promo: false
   },
   {
    from: 17,
    to: 21,
    takes: 0,
    promo: false
   },
   {
    from: 39,
    to: 33,
    takes: 0,
    promo: false
   },
   {
    from: 21,
    to: 26,
    takes: 0,
    promo: false
   },
   {
    from: 37,
    to: 32,
    takes: 0,
    promo: false
   },
   {
    from: 26,
    to: 37,
    takes: 1,
    promo: false
   },
   {
    from: 32,
    to: 41,
    takes: 1,
    promo: false
   },
   {
    from: 11,
    to: 17,
    takes: 0,
    promo: false
   },
   {
    from: 41,
    to: 37,
    takes: 0,
    promo: false
   },
   {
    from: 5,
    to: 10,
    takes: 0,
    promo: false
   },
   {
    from: 44,
    to: 39,
    takes: 0,
    promo: false
   },
   {
    from: 14,
    to: 19,
    takes: 0,
    promo: false
   },
   {
    from: 46,
    to: 41,
    takes: 0,
    promo: false
   },
   {
    from: 10,
    to: 14,
    takes: 0,
    promo: false
   },
   {
    from: 36,
    to: 31,
    takes: 0,
    promo: false
   },
   {
    from: 18,
    to: 23,
    takes: 0,
    promo: false
   },
   {
    from: 38,
    to: 32,
    takes: 0,
    promo: false
   },
   {
    from: 12,
    to: 18,
    takes: 0,
    promo: false
   },
   {
    from: 41,
    to: 36,
    takes: 0,
    promo: false
   },
   {
    from: 7,
    to: 12,
    takes: 0,
    promo: false
   },
   {
    from: 43,
    to: 38,
    takes: 0,
    promo: false
   },
   {
    from: 1,
    to: 7,
    takes: 0,
    promo: false
   },
   {
    from: 49,
    to: 43,
    takes: 0,
    promo: false
   },
   {
    from: 17,
    to: 21,
    takes: 0,
    promo: false
   },
   {
    from: 31,
    to: 27,
    takes: 0,
    promo: false
   },
   {
    from: 21,
    to: 26,
    takes: 0,
    promo: false
   },
   {
    from: 34,
    to: 30,
    takes: 0,
    promo: false
   },
   {
    from: 20,
    to: 24,
    takes: 0,
    promo: false
   },
   {
    from: 30,
    to: 25,
    takes: 0,
    promo: false
   },
   {
    from: 7,
    to: 11,
    takes: 0,
    promo: false
   },
   {
    from: 40,
    to: 34,
    takes: 0,
    promo: false
   },
   {
    from: 11,
    to: 17,
    takes: 0,
    promo: false
   },
   {
    from: 34,
    to: 30,
    takes: 0,
    promo: false
   },
   {
    from: 17,
    to: 21,
    takes: 0,
    promo: false
   },
   {
    from: 45,
    to: 40,
    takes: 0,
    promo: false
   },
   {
    from: 12,
    to: 17,
    takes: 0,
    promo: false
   },
   {
    from: 50,
    to: 45,
    takes: 0,
    promo: false
   },
   {
    from: 17,
    to: 22,
    takes: 0,
    promo: false
   },
   {
    from: 28,
    to: 17,
    takes: 1,
    promo: false
   },
   {
    from: 21,
    to: 12,
    takes: 1,
    promo: false
   },
   {
    from: 33,
    to: 28,
    takes: 0,
    promo: false
   },
   {
    from: 2,
    to: 7,
    takes: 0,
    promo: false
   },
   {
    from: 38,
    to: 33,
    takes: 0,
    promo: false
   },
   {
    from: 7,
    to: 11,
    takes: 0,
    promo: false
   },
   {
    from: 42,
    to: 38,
    takes: 0,
    promo: false
   },
   {
    from: 12,
    to: 17,
    takes: 0,
    promo: false
   },
   {
    from: 47,
    to: 42,
    takes: 0,
    promo: false
   },
   {
    from: 17,
    to: 21,
    takes: 0,
    promo: false
   },
   {
    from: 39,
    to: 34,
    takes: 0,
    promo: false
   },
   {
    from: 8,
    to: 12,
    takes: 0,
    promo: false
   },
   {
    from: 34,
    to: 29,
    takes: 0,
    promo: false
   },
   {
    from: 23,
    to: 34,
    takes: 1,
    promo: false
   },
   {
    from: 40,
    to: 20,
    takes: 2,
    promo: false
   },
   {
    from: 15,
    to: 24,
    takes: 1,
    promo: false
   },
   {
    from: 45,
    to: 40,
    takes: 0,
    promo: false
   },
   {
    from: 18,
    to: 23,
    takes: 0,
    promo: false
   },
   {
    from: 40,
    to: 34,
    takes: 0,
    promo: false
   },
   {
    from: 12,
    to: 18,
    takes: 0,
    promo: false
   },
   {
    from: 27,
    to: 22,
    takes: 0,
    promo: false
   },
   {
    from: 18,
    to: 27,
    takes: 1,
    promo: false
   },
   {
    from: 37,
    to: 31,
    takes: 0,
    promo: false
   },
   {
    from: 26,
    to: 37,
    takes: 1,
    promo: false
   },
   {
    from: 42,
    to: 22,
    takes: 2,
    promo: false
   },
   {
    from: 11,
    to: 17,
    takes: 0,
    promo: false
   },
   {
    from: 22,
    to: 11,
    takes: 1,
    promo: false
   },
   {
    from: 16,
    to: 7,
    takes: 1,
    promo: false
   },
   {
    from: 36,
    to: 31,
    takes: 0,
    promo: false
   },
   {
    from: 7,
    to: 12,
    takes: 0,
    promo: false
   },
   {
    from: 34,
    to: 29,
    takes: 0,
    promo: false
   },
   {
    from: 23,
    to: 34,
    takes: 1,
    promo: false
   },
   {
    from: 30,
    to: 39,
    takes: 1,
    promo: false
   },
   {
    from: 13,
    to: 18,
    takes: 0,
    promo: false
   },
   {
    from: 39,
    to: 34,
    takes: 0,
    promo: false
   },
   {
    from: 18,
    to: 23,
    takes: 0,
    promo: false
   },
   {
    from: 31,
    to: 27,
    takes: 0,
    promo: false
   },
   {
    from: 21,
    to: 26,
    takes: 0,
    promo: false
   },
   {
    from: 34,
    to: 30,
    takes: 0,
    promo: false
   },
   {
    from: 6,
    to: 11,
    takes: 0,
    promo: false
   },
   {
    from: 43,
    to: 39,
    takes: 0,
    promo: false
   },
   {
    from: 23,
    to: 29,
    takes: 0,
    promo: false
   },
   {
    from: 48,
    to: 42,
    takes: 0,
    promo: false
   },
   {
    from: 12,
    to: 18,
    takes: 0,
    promo: false
   },
   {
    from: 28,
    to: 22,
    takes: 0,
    promo: false
   },
   {
    from: 18,
    to: 23,
    takes: 0,
    promo: false
   },
   {
    from: 33,
    to: 28,
    takes: 0,
    promo: false
   },
   {
    from: 9,
    to: 13,
    takes: 0,
    promo: false
   },
   {
    from: 42,
    to: 37,
    takes: 0,
    promo: false
   },
   {
    from: 3,
    to: 8,
    takes: 0,
    promo: false
   },
   {
    from: 39,
    to: 34,
    takes: 0,
    promo: false
   },
   {
    from: 29,
    to: 40,
    takes: 1,
    promo: false
   },
   {
    from: 35,
    to: 44,
    takes: 1,
    promo: false
   },
   {
    from: 24,
    to: 35,
    takes: 1,
    promo: false
   }
  ],
  notes: {
   "0": "Un duel de légendes soviétiques : Kouperman fut sept fois champion du monde. Observe comment chaque camp construit ses colonnes avant de disputer le centre.",
   "99": "La partie s'achève ici — l'avantage noir est décisif."
  }
 },
 {
  id: "anslem1999",
  guessSide: "b",
  white: "Edgar Anslem",
  black: "Iser Kouperman",
  event: "Panaméricain, 1999",
  theme: "Classique et menaces de coup royal",
  intro: "Toute la partie vit sous la menace du COUP ROYAL : regarde comme les menaces tactiques guident les choix positionnels.",
  moves: [
   {
    from: 33,
    to: 28,
    takes: 0,
    promo: false
   },
   {
    from: 18,
    to: 22,
    takes: 0,
    promo: false
   },
   {
    from: 38,
    to: 33,
    takes: 0,
    promo: false
   },
   {
    from: 12,
    to: 18,
    takes: 0,
    promo: false
   },
   {
    from: 42,
    to: 38,
    takes: 0,
    promo: false
   },
   {
    from: 7,
    to: 12,
    takes: 0,
    promo: false
   },
   {
    from: 47,
    to: 42,
    takes: 0,
    promo: false
   },
   {
    from: 1,
    to: 7,
    takes: 0,
    promo: false
   },
   {
    from: 32,
    to: 27,
    takes: 0,
    promo: false
   },
   {
    from: 19,
    to: 23,
    takes: 0,
    promo: false
   },
   {
    from: 28,
    to: 19,
    takes: 1,
    promo: false
   },
   {
    from: 14,
    to: 23,
    takes: 1,
    promo: false
   },
   {
    from: 34,
    to: 29,
    takes: 0,
    promo: false
   },
   {
    from: 23,
    to: 34,
    takes: 1,
    promo: false
   },
   {
    from: 40,
    to: 29,
    takes: 1,
    promo: false
   },
   {
    from: 20,
    to: 25,
    takes: 0,
    promo: false
   },
   {
    from: 37,
    to: 32,
    takes: 0,
    promo: false
   },
   {
    from: 17,
    to: 21,
    takes: 0,
    promo: false
   },
   {
    from: 31,
    to: 26,
    takes: 0,
    promo: false
   },
   {
    from: 22,
    to: 31,
    takes: 1,
    promo: false
   },
   {
    from: 26,
    to: 37,
    takes: 1,
    promo: false
   },
   {
    from: 21,
    to: 26,
    takes: 0,
    promo: false
   },
   {
    from: 45,
    to: 40,
    takes: 0,
    promo: false
   },
   {
    from: 10,
    to: 14,
    takes: 0,
    promo: false
   },
   {
    from: 40,
    to: 34,
    takes: 0,
    promo: false
   },
   {
    from: 14,
    to: 20,
    takes: 0,
    promo: false
   },
   {
    from: 44,
    to: 40,
    takes: 0,
    promo: false
   },
   {
    from: 5,
    to: 10,
    takes: 0,
    promo: false
   },
   {
    from: 32,
    to: 28,
    takes: 0,
    promo: false
   },
   {
    from: 11,
    to: 17,
    takes: 0,
    promo: false
   },
   {
    from: 37,
    to: 31,
    takes: 0,
    promo: false
   },
   {
    from: 26,
    to: 37,
    takes: 1,
    promo: false
   },
   {
    from: 41,
    to: 32,
    takes: 1,
    promo: false
   },
   {
    from: 20,
    to: 24,
    takes: 0,
    promo: false
   },
   {
    from: 29,
    to: 20,
    takes: 1,
    promo: false
   },
   {
    from: 25,
    to: 14,
    takes: 1,
    promo: false
   },
   {
    from: 46,
    to: 41,
    takes: 0,
    promo: false
   },
   {
    from: 14,
    to: 19,
    takes: 0,
    promo: false
   },
   {
    from: 41,
    to: 37,
    takes: 0,
    promo: false
   },
   {
    from: 19,
    to: 24,
    takes: 0,
    promo: false
   },
   {
    from: 49,
    to: 44,
    takes: 0,
    promo: false
   },
   {
    from: 17,
    to: 21,
    takes: 0,
    promo: false
   },
   {
    from: 34,
    to: 30,
    takes: 0,
    promo: false
   },
   {
    from: 13,
    to: 19,
    takes: 0,
    promo: false
   },
   {
    from: 39,
    to: 34,
    takes: 0,
    promo: false
   },
   {
    from: 18,
    to: 23,
    takes: 0,
    promo: false
   },
   {
    from: 37,
    to: 31,
    takes: 0,
    promo: false
   },
   {
    from: 10,
    to: 14,
    takes: 0,
    promo: false
   },
   {
    from: 44,
    to: 39,
    takes: 0,
    promo: false
   },
   {
    from: 8,
    to: 13,
    takes: 0,
    promo: false
   },
   {
    from: 50,
    to: 45,
    takes: 0,
    promo: false
   },
   {
    from: 12,
    to: 18,
    takes: 0,
    promo: false
   },
   {
    from: 31,
    to: 27,
    takes: 0,
    promo: false
   },
   {
    from: 21,
    to: 26,
    takes: 0,
    promo: false
   },
   {
    from: 36,
    to: 31,
    takes: 0,
    promo: false
   },
   {
    from: 26,
    to: 37,
    takes: 1,
    promo: false
   },
   {
    from: 42,
    to: 31,
    takes: 1,
    promo: false
   },
   {
    from: 15,
    to: 20,
    takes: 0,
    promo: false
   },
   {
    from: 30,
    to: 25,
    takes: 0,
    promo: false
   },
   {
    from: 16,
    to: 21,
    takes: 0,
    promo: false
   },
   {
    from: 27,
    to: 16,
    takes: 1,
    promo: false
   },
   {
    from: 18,
    to: 22,
    takes: 0,
    promo: false
   },
   {
    from: 28,
    to: 17,
    takes: 1,
    promo: false
   },
   {
    from: 23,
    to: 29,
    takes: 0,
    promo: false
   },
   {
    from: 34,
    to: 23,
    takes: 1,
    promo: false
   },
   {
    from: 19,
    to: 26,
    takes: 3,
    promo: false
   }
  ],
  notes: {
   "0": "Toute la partie vit sous la menace du COUP ROYAL : regarde comme les menaces tactiques guident les choix positionnels.",
   "65": "Rafle de 3 pièces ! Les Noirs frappent (19x26). La partie s'achève ici, sur une position tendue."
  }
 },
 {
  id: "adrichem2011",
  guessSide: "b",
  white: "Ton Adrichem",
  black: "Viacheslav Shchegolev",
  event: "Pays-Bas, 2011",
  theme: "Classique avec avancée Ghestem",
  intro: "L'avancée Ghestem jouée par les NOIRS cette fois : le système que Gaspard enseigne à l'Académie, en conditions réelles.",
  moves: [
   {
    from: 32,
    to: 28,
    takes: 0,
    promo: false
   },
   {
    from: 20,
    to: 25,
    takes: 0,
    promo: false
   },
   {
    from: 37,
    to: 32,
    takes: 0,
    promo: false
   },
   {
    from: 14,
    to: 20,
    takes: 0,
    promo: false
   },
   {
    from: 41,
    to: 37,
    takes: 0,
    promo: false
   },
   {
    from: 10,
    to: 14,
    takes: 0,
    promo: false
   },
   {
    from: 46,
    to: 41,
    takes: 0,
    promo: false
   },
   {
    from: 5,
    to: 10,
    takes: 0,
    promo: false
   },
   {
    from: 31,
    to: 27,
    takes: 0,
    promo: false
   },
   {
    from: 20,
    to: 24,
    takes: 0,
    promo: false
   },
   {
    from: 36,
    to: 31,
    takes: 0,
    promo: false
   },
   {
    from: 15,
    to: 20,
    takes: 0,
    promo: false
   },
   {
    from: 34,
    to: 30,
    takes: 0,
    promo: false
   },
   {
    from: 25,
    to: 34,
    takes: 1,
    promo: false
   },
   {
    from: 39,
    to: 30,
    takes: 1,
    promo: false
   },
   {
    from: 18,
    to: 23,
    takes: 0,
    promo: false
   },
   {
    from: 30,
    to: 25,
    takes: 0,
    promo: false
   },
   {
    from: 12,
    to: 18,
    takes: 0,
    promo: false
   },
   {
    from: 44,
    to: 39,
    takes: 0,
    promo: false
   },
   {
    from: 10,
    to: 15,
    takes: 0,
    promo: false
   },
   {
    from: 40,
    to: 34,
    takes: 0,
    promo: false
   },
   {
    from: 24,
    to: 29,
    takes: 0,
    promo: false
   },
   {
    from: 33,
    to: 24,
    takes: 1,
    promo: false
   },
   {
    from: 20,
    to: 40,
    takes: 2,
    promo: false
   },
   {
    from: 45,
    to: 34,
    takes: 1,
    promo: false
   },
   {
    from: 17,
    to: 22,
    takes: 0,
    promo: false
   },
   {
    from: 28,
    to: 17,
    takes: 1,
    promo: false
   },
   {
    from: 11,
    to: 22,
    takes: 1,
    promo: false
   },
   {
    from: 34,
    to: 29,
    takes: 0,
    promo: false
   },
   {
    from: 23,
    to: 34,
    takes: 1,
    promo: false
   },
   {
    from: 39,
    to: 30,
    takes: 1,
    promo: false
   },
   {
    from: 19,
    to: 23,
    takes: 0,
    promo: false
   },
   {
    from: 38,
    to: 33,
    takes: 0,
    promo: false
   },
   {
    from: 7,
    to: 12,
    takes: 0,
    promo: false
   },
   {
    from: 42,
    to: 38,
    takes: 0,
    promo: false
   },
   {
    from: 13,
    to: 19,
    takes: 0,
    promo: false
   },
   {
    from: 41,
    to: 36,
    takes: 0,
    promo: false
   },
   {
    from: 6,
    to: 11,
    takes: 0,
    promo: false
   },
   {
    from: 47,
    to: 42,
    takes: 0,
    promo: false
   },
   {
    from: 8,
    to: 13,
    takes: 0,
    promo: false
   },
   {
    from: 49,
    to: 44,
    takes: 0,
    promo: false
   },
   {
    from: 2,
    to: 8,
    takes: 0,
    promo: false
   },
   {
    from: 33,
    to: 29,
    takes: 0,
    promo: false
   },
   {
    from: 23,
    to: 34,
    takes: 1,
    promo: false
   },
   {
    from: 30,
    to: 39,
    takes: 1,
    promo: false
   },
   {
    from: 19,
    to: 23,
    takes: 0,
    promo: false
   },
   {
    from: 39,
    to: 33,
    takes: 0,
    promo: false
   },
   {
    from: 14,
    to: 19,
    takes: 0,
    promo: false
   },
   {
    from: 43,
    to: 39,
    takes: 0,
    promo: false
   },
   {
    from: 9,
    to: 14,
    takes: 0,
    promo: false
   },
   {
    from: 33,
    to: 28,
    takes: 0,
    promo: false
   },
   {
    from: 22,
    to: 33,
    takes: 1,
    promo: false
   },
   {
    from: 39,
    to: 28,
    takes: 1,
    promo: false
   },
   {
    from: 15,
    to: 20,
    takes: 0,
    promo: false
   },
   {
    from: 44,
    to: 40,
    takes: 0,
    promo: false
   },
   {
    from: 1,
    to: 6,
    takes: 0,
    promo: false
   },
   {
    from: 40,
    to: 34,
    takes: 0,
    promo: false
   },
   {
    from: 20,
    to: 24,
    takes: 0,
    promo: false
   },
   {
    from: 34,
    to: 30,
    takes: 0,
    promo: false
   },
   {
    from: 12,
    to: 17,
    takes: 0,
    promo: false
   },
   {
    from: 28,
    to: 22,
    takes: 0,
    promo: false
   },
   {
    from: 17,
    to: 28,
    takes: 1,
    promo: false
   },
   {
    from: 27,
    to: 21,
    takes: 0,
    promo: false
   },
   {
    from: 16,
    to: 27,
    takes: 1,
    promo: false
   },
   {
    from: 31,
    to: 33,
    takes: 2,
    promo: false
   },
   {
    from: 8,
    to: 12,
    takes: 0,
    promo: false
   },
   {
    from: 32,
    to: 27,
    takes: 0,
    promo: false
   },
   {
    from: 11,
    to: 17,
    takes: 0,
    promo: false
   },
   {
    from: 37,
    to: 32,
    takes: 0,
    promo: false
   },
   {
    from: 6,
    to: 11,
    takes: 0,
    promo: false
   },
   {
    from: 36,
    to: 31,
    takes: 0,
    promo: false
   },
   {
    from: 3,
    to: 8,
    takes: 0,
    promo: false
   },
   {
    from: 33,
    to: 28,
    takes: 0,
    promo: false
   },
   {
    from: 11,
    to: 16,
    takes: 0,
    promo: false
   },
   {
    from: 50,
    to: 44,
    takes: 0,
    promo: false
   },
   {
    from: 23,
    to: 29,
    takes: 0,
    promo: false
   },
   {
    from: 42,
    to: 37,
    takes: 0,
    promo: false
   },
   {
    from: 18,
    to: 23,
    takes: 0,
    promo: false
   },
   {
    from: 44,
    to: 40,
    takes: 0,
    promo: false
   },
   {
    from: 17,
    to: 21,
    takes: 0,
    promo: false
   },
   {
    from: 31,
    to: 26,
    takes: 0,
    promo: false
   },
   {
    from: 4,
    to: 10,
    takes: 0,
    promo: false
   },
   {
    from: 26,
    to: 17,
    takes: 1,
    promo: false
   },
   {
    from: 12,
    to: 21,
    takes: 1,
    promo: false
   },
   {
    from: 28,
    to: 22,
    takes: 0,
    promo: false
   },
   {
    from: 10,
    to: 15,
    takes: 0,
    promo: false
   },
   {
    from: 37,
    to: 31,
    takes: 0,
    promo: false
   },
   {
    from: 23,
    to: 28,
    takes: 0,
    promo: false
   },
   {
    from: 32,
    to: 34,
    takes: 2,
    promo: false
   },
   {
    from: 21,
    to: 43,
    takes: 2,
    promo: false
   },
   {
    from: 48,
    to: 39,
    takes: 1,
    promo: false
   },
   {
    from: 24,
    to: 29,
    takes: 0,
    promo: false
   },
   {
    from: 34,
    to: 23,
    takes: 1,
    promo: false
   },
   {
    from: 19,
    to: 17,
    takes: 2,
    promo: false
   }
  ],
  notes: {
   "0": "L'avancée Ghestem jouée par les NOIRS cette fois : le système que Gaspard enseigne à l'Académie, en conditions réelles.",
   "93": "La partie s'achève ici, sur une position tendue."
  }
 },
 {
  id: "sijbrands1967",
  guessSide: "w",
  white: "Ton Sijbrands",
  black: "Cees Varkevisser",
  event: "Trophée de Rijswijk, 1967",
  theme: "Classique semi-ouvert",
  intro: "Le jeune Sijbrands — futur géant du jeu mondial — dans une partie semi-ouverte : un camp tient le centre, l'autre l'encercle.",
  moves: [
   {
    from: 32,
    to: 28,
    takes: 0,
    promo: false
   },
   {
    from: 20,
    to: 24,
    takes: 0,
    promo: false
   },
   {
    from: 34,
    to: 30,
    takes: 0,
    promo: false
   },
   {
    from: 18,
    to: 23,
    takes: 0,
    promo: false
   },
   {
    from: 30,
    to: 25,
    takes: 0,
    promo: false
   },
   {
    from: 23,
    to: 32,
    takes: 1,
    promo: false
   },
   {
    from: 37,
    to: 28,
    takes: 1,
    promo: false
   },
   {
    from: 13,
    to: 18,
    takes: 0,
    promo: false
   },
   {
    from: 41,
    to: 37,
    takes: 0,
    promo: false
   },
   {
    from: 17,
    to: 21,
    takes: 0,
    promo: false
   },
   {
    from: 37,
    to: 32,
    takes: 0,
    promo: false
   },
   {
    from: 21,
    to: 26,
    takes: 0,
    promo: false
   },
   {
    from: 40,
    to: 34,
    takes: 0,
    promo: false
   },
   {
    from: 26,
    to: 37,
    takes: 1,
    promo: false
   },
   {
    from: 42,
    to: 31,
    takes: 1,
    promo: false
   },
   {
    from: 16,
    to: 21,
    takes: 0,
    promo: false
   },
   {
    from: 46,
    to: 41,
    takes: 0,
    promo: false
   },
   {
    from: 21,
    to: 26,
    takes: 0,
    promo: false
   },
   {
    from: 41,
    to: 37,
    takes: 0,
    promo: false
   },
   {
    from: 11,
    to: 16,
    takes: 0,
    promo: false
   },
   {
    from: 47,
    to: 42,
    takes: 0,
    promo: false
   },
   {
    from: 7,
    to: 11,
    takes: 0,
    promo: false
   },
   {
    from: 45,
    to: 40,
    takes: 0,
    promo: false
   },
   {
    from: 8,
    to: 13,
    takes: 0,
    promo: false
   },
   {
    from: 34,
    to: 30,
    takes: 0,
    promo: false
   },
   {
    from: 2,
    to: 8,
    takes: 0,
    promo: false
   },
   {
    from: 39,
    to: 34,
    takes: 0,
    promo: false
   },
   {
    from: 11,
    to: 17,
    takes: 0,
    promo: false
   },
   {
    from: 44,
    to: 39,
    takes: 0,
    promo: false
   },
   {
    from: 17,
    to: 21,
    takes: 0,
    promo: false
   },
   {
    from: 31,
    to: 27,
    takes: 0,
    promo: false
   },
   {
    from: 12,
    to: 17,
    takes: 0,
    promo: false
   },
   {
    from: 34,
    to: 29,
    takes: 0,
    promo: false
   },
   {
    from: 17,
    to: 22,
    takes: 0,
    promo: false
   },
   {
    from: 28,
    to: 17,
    takes: 1,
    promo: false
   },
   {
    from: 21,
    to: 12,
    takes: 1,
    promo: false
   },
   {
    from: 29,
    to: 20,
    takes: 1,
    promo: false
   },
   {
    from: 15,
    to: 24,
    takes: 1,
    promo: false
   },
   {
    from: 33,
    to: 28,
    takes: 0,
    promo: false
   },
   {
    from: 18,
    to: 23,
    takes: 0,
    promo: false
   }
  ],
  notes: {
   "0": "Le jeune Sijbrands — futur géant du jeu mondial — dans une partie semi-ouverte : un camp tient le centre, l'autre l'encercle.",
   "39": "La partie s'achève ici, sur une position tendue."
  }
 },
 {
  id: "boomstra_pion15",
  guessSide: "w",
  white: "Roel Boomstra",
  black: "Anton Schotanus",
  event: "Début Bizot (pion blanc à 15)",
  theme: "Le pion de bande 15",
  intro: "Une spécialité moderne : le pion blanc planté en 15 dès l'ouverture. Boomstra, multiple champion du monde, en tire un maximum.",
  moves: [
   {
    from: 34,
    to: 30,
    takes: 0,
    promo: false
   },
   {
    from: 20,
    to: 25,
    takes: 0,
    promo: false
   },
   {
    from: 30,
    to: 24,
    takes: 0,
    promo: false
   },
   {
    from: 19,
    to: 30,
    takes: 1,
    promo: false
   },
   {
    from: 35,
    to: 24,
    takes: 1,
    promo: false
   },
   {
    from: 18,
    to: 22,
    takes: 0,
    promo: false
   },
   {
    from: 31,
    to: 26,
    takes: 0,
    promo: false
   },
   {
    from: 14,
    to: 19,
    takes: 0,
    promo: false
   },
   {
    from: 40,
    to: 35,
    takes: 0,
    promo: false
   },
   {
    from: 19,
    to: 30,
    takes: 1,
    promo: false
   },
   {
    from: 35,
    to: 24,
    takes: 1,
    promo: false
   },
   {
    from: 10,
    to: 14,
    takes: 0,
    promo: false
   },
   {
    from: 24,
    to: 20,
    takes: 0,
    promo: false
   },
   {
    from: 15,
    to: 24,
    takes: 1,
    promo: false
   },
   {
    from: 33,
    to: 28,
    takes: 0,
    promo: false
   },
   {
    from: 22,
    to: 33,
    takes: 1,
    promo: false
   },
   {
    from: 38,
    to: 20,
    takes: 2,
    promo: false
   },
   {
    from: 12,
    to: 18,
    takes: 0,
    promo: false
   },
   {
    from: 20,
    to: 15,
    takes: 0,
    promo: false
   },
   {
    from: 7,
    to: 12,
    takes: 0,
    promo: false
   },
   {
    from: 42,
    to: 38,
    takes: 0,
    promo: false
   },
   {
    from: 1,
    to: 7,
    takes: 0,
    promo: false
   },
   {
    from: 39,
    to: 33,
    takes: 0,
    promo: false
   },
   {
    from: 18,
    to: 23,
    takes: 0,
    promo: false
   },
   {
    from: 36,
    to: 31,
    takes: 0,
    promo: false
   },
   {
    from: 14,
    to: 19,
    takes: 0,
    promo: false
   },
   {
    from: 44,
    to: 39,
    takes: 0,
    promo: false
   },
   {
    from: 19,
    to: 24,
    takes: 0,
    promo: false
   },
   {
    from: 49,
    to: 44,
    takes: 0,
    promo: false
   },
   {
    from: 13,
    to: 19,
    takes: 0,
    promo: false
   },
   {
    from: 47,
    to: 42,
    takes: 0,
    promo: false
   },
   {
    from: 9,
    to: 13,
    takes: 0,
    promo: false
   },
   {
    from: 41,
    to: 36,
    takes: 0,
    promo: false
   },
   {
    from: 12,
    to: 18,
    takes: 0,
    promo: false
   },
   {
    from: 46,
    to: 41,
    takes: 0,
    promo: false
   },
   {
    from: 7,
    to: 12,
    takes: 0,
    promo: false
   },
   {
    from: 45,
    to: 40,
    takes: 0,
    promo: false
   },
   {
    from: 5,
    to: 10,
    takes: 0,
    promo: false
   },
   {
    from: 32,
    to: 28,
    takes: 0,
    promo: false
   },
   {
    from: 23,
    to: 32,
    takes: 1,
    promo: false
   },
   {
    from: 37,
    to: 28,
    takes: 1,
    promo: false
   },
   {
    from: 18,
    to: 23,
    takes: 0,
    promo: false
   },
   {
    from: 42,
    to: 37,
    takes: 0,
    promo: false
   },
   {
    from: 23,
    to: 32,
    takes: 1,
    promo: false
   },
   {
    from: 37,
    to: 28,
    takes: 1,
    promo: false
   },
   {
    from: 12,
    to: 18,
    takes: 0,
    promo: false
   },
   {
    from: 41,
    to: 37,
    takes: 0,
    promo: false
   },
   {
    from: 18,
    to: 23,
    takes: 0,
    promo: false
   },
   {
    from: 37,
    to: 32,
    takes: 0,
    promo: false
   },
   {
    from: 8,
    to: 12,
    takes: 0,
    promo: false
   },
   {
    from: 40,
    to: 34,
    takes: 0,
    promo: false
   },
   {
    from: 3,
    to: 8,
    takes: 0,
    promo: false
   },
   {
    from: 44,
    to: 40,
    takes: 0,
    promo: false
   },
   {
    from: 12,
    to: 18,
    takes: 0,
    promo: false
   },
   {
    from: 50,
    to: 45,
    takes: 0,
    promo: false
   },
   {
    from: 2,
    to: 7,
    takes: 0,
    promo: false
   },
   {
    from: 48,
    to: 42,
    takes: 0,
    promo: false
   },
   {
    from: 7,
    to: 12,
    takes: 0,
    promo: false
   },
   {
    from: 31,
    to: 27,
    takes: 0,
    promo: false
   },
   {
    from: 24,
    to: 29,
    takes: 0,
    promo: false
   },
   {
    from: 33,
    to: 24,
    takes: 1,
    promo: false
   },
   {
    from: 19,
    to: 30,
    takes: 1,
    promo: false
   },
   {
    from: 28,
    to: 19,
    takes: 1,
    promo: false
   },
   {
    from: 13,
    to: 24,
    takes: 1,
    promo: false
   }
  ],
  notes: {
   "0": "Une spécialité moderne : le pion blanc planté en 15 dès l'ouverture. Boomstra, multiple champion du monde, en tire un maximum.",
   "63": "La partie s'achève ici, sur une position tendue."
  }
 },
 {
  id: "chizhov1998",
  guessSide: "w",
  white: "Alexey Chizhov",
  black: "Rob Clerc",
  event: "Masters de Leeuwarden, 1998",
  theme: "Lutte pour les cases stratégiques",
  intro: "Chizhov, l'homme aux dix titres mondiaux. Ici, pas de feu d'artifice : une lutte implacable pour CHAQUE case stratégique.",
  moves: [
   {
    from: 34,
    to: 29,
    takes: 0,
    promo: false
   },
   {
    from: 19,
    to: 23,
    takes: 0,
    promo: false
   },
   {
    from: 40,
    to: 34,
    takes: 0,
    promo: false
   },
   {
    from: 14,
    to: 19,
    takes: 0,
    promo: false
   },
   {
    from: 33,
    to: 28,
    takes: 0,
    promo: false
   },
   {
    from: 10,
    to: 14,
    takes: 0,
    promo: false
   },
   {
    from: 38,
    to: 33,
    takes: 0,
    promo: false
   },
   {
    from: 17,
    to: 22,
    takes: 0,
    promo: false
   },
   {
    from: 28,
    to: 17,
    takes: 1,
    promo: false
   },
   {
    from: 11,
    to: 22,
    takes: 1,
    promo: false
   },
   {
    from: 43,
    to: 38,
    takes: 0,
    promo: false
   },
   {
    from: 6,
    to: 11,
    takes: 0,
    promo: false
   },
   {
    from: 48,
    to: 43,
    takes: 0,
    promo: false
   },
   {
    from: 12,
    to: 17,
    takes: 0,
    promo: false
   },
   {
    from: 45,
    to: 40,
    takes: 0,
    promo: false
   },
   {
    from: 5,
    to: 10,
    takes: 0,
    promo: false
   },
   {
    from: 50,
    to: 45,
    takes: 0,
    promo: false
   },
   {
    from: 8,
    to: 12,
    takes: 0,
    promo: false
   },
   {
    from: 32,
    to: 28,
    takes: 0,
    promo: false
   },
   {
    from: 23,
    to: 32,
    takes: 1,
    promo: false
   },
   {
    from: 37,
    to: 28,
    takes: 1,
    promo: false
   },
   {
    from: 16,
    to: 21,
    takes: 0,
    promo: false
   },
   {
    from: 31,
    to: 26,
    takes: 0,
    promo: false
   },
   {
    from: 21,
    to: 27,
    takes: 0,
    promo: false
   },
   {
    from: 36,
    to: 31,
    takes: 0,
    promo: false
   },
   {
    from: 27,
    to: 36,
    takes: 1,
    promo: false
   },
   {
    from: 26,
    to: 21,
    takes: 0,
    promo: false
   },
   {
    from: 17,
    to: 26,
    takes: 1,
    promo: false
   },
   {
    from: 28,
    to: 6,
    takes: 2,
    promo: false
   },
   {
    from: 20,
    to: 24,
    takes: 0,
    promo: false
   },
   {
    from: 29,
    to: 20,
    takes: 1,
    promo: false
   },
   {
    from: 15,
    to: 24,
    takes: 1,
    promo: false
   },
   {
    from: 34,
    to: 30,
    takes: 0,
    promo: false
   },
   {
    from: 18,
    to: 23,
    takes: 0,
    promo: false
   },
   {
    from: 40,
    to: 34,
    takes: 0,
    promo: false
   },
   {
    from: 12,
    to: 18,
    takes: 0,
    promo: false
   },
   {
    from: 30,
    to: 25,
    takes: 0,
    promo: false
   },
   {
    from: 7,
    to: 12,
    takes: 0,
    promo: false
   },
   {
    from: 34,
    to: 29,
    takes: 0,
    promo: false
   },
   {
    from: 23,
    to: 34,
    takes: 1,
    promo: false
   },
   {
    from: 39,
    to: 30,
    takes: 1,
    promo: false
   },
   {
    from: 2,
    to: 7,
    takes: 0,
    promo: false
   },
   {
    from: 41,
    to: 37,
    takes: 0,
    promo: false
   },
   {
    from: 18,
    to: 23,
    takes: 0,
    promo: false
   },
   {
    from: 33,
    to: 29,
    takes: 0,
    promo: false
   },
   {
    from: 23,
    to: 34,
    takes: 1,
    promo: false
   },
   {
    from: 30,
    to: 39,
    takes: 1,
    promo: false
   },
   {
    from: 19,
    to: 23,
    takes: 0,
    promo: false
   },
   {
    from: 39,
    to: 33,
    takes: 0,
    promo: false
   },
   {
    from: 14,
    to: 19,
    takes: 0,
    promo: false
   },
   {
    from: 44,
    to: 39,
    takes: 0,
    promo: false
   },
   {
    from: 10,
    to: 14,
    takes: 0,
    promo: false
   },
   {
    from: 45,
    to: 40,
    takes: 0,
    promo: false
   },
   {
    from: 12,
    to: 17,
    takes: 0,
    promo: false
   },
   {
    from: 46,
    to: 41,
    takes: 0,
    promo: false
   },
   {
    from: 17,
    to: 22,
    takes: 0,
    promo: false
   },
   {
    from: 37,
    to: 32,
    takes: 0,
    promo: false
   },
   {
    from: 13,
    to: 18,
    takes: 0,
    promo: false
   },
   {
    from: 42,
    to: 37,
    takes: 0,
    promo: false
   },
   {
    from: 22,
    to: 27,
    takes: 0,
    promo: false
   },
   {
    from: 32,
    to: 21,
    takes: 1,
    promo: false
   },
   {
    from: 26,
    to: 17,
    takes: 1,
    promo: false
   },
   {
    from: 33,
    to: 28,
    takes: 0,
    promo: false
   },
   {
    from: 23,
    to: 32,
    takes: 1,
    promo: false
   },
   {
    from: 38,
    to: 27,
    takes: 1,
    promo: false
   },
   {
    from: 19,
    to: 23,
    takes: 0,
    promo: false
   },
   {
    from: 37,
    to: 32,
    takes: 0,
    promo: false
   },
   {
    from: 14,
    to: 19,
    takes: 0,
    promo: false
   },
   {
    from: 41,
    to: 37,
    takes: 0,
    promo: false
   },
   {
    from: 9,
    to: 13,
    takes: 0,
    promo: false
   },
   {
    from: 37,
    to: 31,
    takes: 0,
    promo: false
   },
   {
    from: 17,
    to: 22,
    takes: 0,
    promo: false
   },
   {
    from: 31,
    to: 26,
    takes: 0,
    promo: false
   },
   {
    from: 22,
    to: 31,
    takes: 1,
    promo: false
   },
   {
    from: 26,
    to: 37,
    takes: 1,
    promo: false
   },
   {
    from: 18,
    to: 22,
    takes: 0,
    promo: false
   },
   {
    from: 39,
    to: 33,
    takes: 0,
    promo: false
   },
   {
    from: 13,
    to: 18,
    takes: 0,
    promo: false
   },
   {
    from: 40,
    to: 34,
    takes: 0,
    promo: false
   },
   {
    from: 22,
    to: 27,
    takes: 0,
    promo: false
   },
   {
    from: 32,
    to: 21,
    takes: 1,
    promo: false
   },
   {
    from: 7,
    to: 11,
    takes: 0,
    promo: false
   },
   {
    from: 6,
    to: 17,
    takes: 1,
    promo: false
   },
   {
    from: 18,
    to: 22,
    takes: 0,
    promo: false
   },
   {
    from: 17,
    to: 28,
    takes: 1,
    promo: false
   },
   {
    from: 23,
    to: 41,
    takes: 2,
    promo: false
   },
   {
    from: 34,
    to: 29,
    takes: 0,
    promo: false
   },
   {
    from: 41,
    to: 46,
    takes: 0,
    promo: true
   },
   {
    from: 29,
    to: 20,
    takes: 1,
    promo: false
   },
   {
    from: 46,
    to: 37,
    takes: 0,
    promo: false
   },
   {
    from: 20,
    to: 15,
    takes: 0,
    promo: false
   },
   {
    from: 19,
    to: 24,
    takes: 0,
    promo: false
   },
   {
    from: 43,
    to: 38,
    takes: 0,
    promo: false
   },
   {
    from: 3,
    to: 9,
    takes: 0,
    promo: false
   },
   {
    from: 21,
    to: 16,
    takes: 0,
    promo: false
   },
   {
    from: 9,
    to: 14,
    takes: 0,
    promo: false
   },
   {
    from: 16,
    to: 11,
    takes: 0,
    promo: false
   },
   {
    from: 37,
    to: 46,
    takes: 0,
    promo: false
   },
   {
    from: 49,
    to: 44,
    takes: 0,
    promo: false
   },
   {
    from: 46,
    to: 37,
    takes: 0,
    promo: false
   },
   {
    from: 44,
    to: 39,
    takes: 0,
    promo: false
   },
   {
    from: 37,
    to: 23,
    takes: 0,
    promo: false
   },
   {
    from: 11,
    to: 6,
    takes: 0,
    promo: false
   },
   {
    from: 14,
    to: 19,
    takes: 0,
    promo: false
   },
   {
    from: 39,
    to: 34,
    takes: 0,
    promo: false
   },
   {
    from: 23,
    to: 45,
    takes: 1,
    promo: false
   },
   {
    from: 38,
    to: 32,
    takes: 0,
    promo: false
   },
   {
    from: 45,
    to: 50,
    takes: 0,
    promo: false
   }
  ],
  notes: {
   "0": "Chizhov, l'homme aux dix titres mondiaux. Ici, pas de feu d'artifice : une lutte implacable pour CHAQUE case stratégique.",
   "87": "Promotion : les Noirs prennent dame.",
   "107": "La partie s'achève ici, sur une position tendue."
  }
 },
 {
  id: "gantwarg",
  guessSide: "b",
  white: "Zalitis",
  black: "Anatoli Gantwarg",
  event: "Championnat d'URSS",
  theme: "Le squelette anonyme",
  intro: "La partie qui fit de Gantwarg un champion d'URSS — considérée comme l'une des plus belles de sa carrière.",
  moves: [
   {
    from: 32,
    to: 28,
    takes: 0,
    promo: false
   },
   {
    from: 18,
    to: 23,
    takes: 0,
    promo: false
   },
   {
    from: 33,
    to: 29,
    takes: 0,
    promo: false
   },
   {
    from: 23,
    to: 32,
    takes: 1,
    promo: false
   },
   {
    from: 37,
    to: 28,
    takes: 1,
    promo: false
   },
   {
    from: 17,
    to: 22,
    takes: 0,
    promo: false
   },
   {
    from: 28,
    to: 17,
    takes: 1,
    promo: false
   },
   {
    from: 11,
    to: 22,
    takes: 1,
    promo: false
   },
   {
    from: 41,
    to: 37,
    takes: 0,
    promo: false
   },
   {
    from: 13,
    to: 18,
    takes: 0,
    promo: false
   },
   {
    from: 34,
    to: 30,
    takes: 0,
    promo: false
   },
   {
    from: 6,
    to: 11,
    takes: 0,
    promo: false
   },
   {
    from: 30,
    to: 25,
    takes: 0,
    promo: false
   },
   {
    from: 16,
    to: 21,
    takes: 0,
    promo: false
   },
   {
    from: 39,
    to: 33,
    takes: 0,
    promo: false
   },
   {
    from: 21,
    to: 26,
    takes: 0,
    promo: false
   },
   {
    from: 31,
    to: 27,
    takes: 0,
    promo: false
   },
   {
    from: 22,
    to: 31,
    takes: 1,
    promo: false
   },
   {
    from: 36,
    to: 27,
    takes: 1,
    promo: false
   },
   {
    from: 9,
    to: 13,
    takes: 0,
    promo: false
   },
   {
    from: 44,
    to: 39,
    takes: 0,
    promo: false
   },
   {
    from: 11,
    to: 17,
    takes: 0,
    promo: false
   },
   {
    from: 46,
    to: 41,
    takes: 0,
    promo: false
   },
   {
    from: 19,
    to: 24,
    takes: 0,
    promo: false
   },
   {
    from: 39,
    to: 34,
    takes: 0,
    promo: false
   },
   {
    from: 4,
    to: 9,
    takes: 0,
    promo: false
   },
   {
    from: 27,
    to: 21,
    takes: 0,
    promo: false
   },
   {
    from: 1,
    to: 6,
    takes: 0,
    promo: false
   },
   {
    from: 21,
    to: 16,
    takes: 0,
    promo: false
   },
   {
    from: 17,
    to: 22,
    takes: 0,
    promo: false
   },
   {
    from: 41,
    to: 36,
    takes: 0,
    promo: false
   },
   {
    from: 6,
    to: 11,
    takes: 0,
    promo: false
   },
   {
    from: 49,
    to: 44,
    takes: 0,
    promo: false
   },
   {
    from: 13,
    to: 19,
    takes: 0,
    promo: false
   },
   {
    from: 34,
    to: 30,
    takes: 0,
    promo: false
   },
   {
    from: 9,
    to: 13,
    takes: 0,
    promo: false
   },
   {
    from: 43,
    to: 39,
    takes: 0,
    promo: false
   },
   {
    from: 11,
    to: 17,
    takes: 0,
    promo: false
   },
   {
    from: 40,
    to: 34,
    takes: 0,
    promo: false
   },
   {
    from: 7,
    to: 11,
    takes: 0,
    promo: false
   },
   {
    from: 16,
    to: 7,
    takes: 1,
    promo: false
   },
   {
    from: 2,
    to: 11,
    takes: 1,
    promo: false
   },
   {
    from: 45,
    to: 40,
    takes: 0,
    promo: false
   },
   {
    from: 17,
    to: 21,
    takes: 0,
    promo: false
   },
   {
    from: 50,
    to: 45,
    takes: 0,
    promo: false
   },
   {
    from: 11,
    to: 16,
    takes: 0,
    promo: false
   },
   {
    from: 38,
    to: 32,
    takes: 0,
    promo: false
   },
   {
    from: 22,
    to: 27,
    takes: 0,
    promo: false
   },
   {
    from: 42,
    to: 38,
    takes: 0,
    promo: false
   },
   {
    from: 18,
    to: 22,
    takes: 0,
    promo: false
   },
   {
    from: 47,
    to: 42,
    takes: 0,
    promo: false
   },
   {
    from: 12,
    to: 17,
    takes: 0,
    promo: false
   },
   {
    from: 48,
    to: 43,
    takes: 0,
    promo: false
   },
   {
    from: 13,
    to: 18,
    takes: 0,
    promo: false
   },
   {
    from: 29,
    to: 23,
    takes: 0,
    promo: false
   },
   {
    from: 18,
    to: 29,
    takes: 1,
    promo: false
   },
   {
    from: 34,
    to: 23,
    takes: 1,
    promo: false
   },
   {
    from: 19,
    to: 28,
    takes: 1,
    promo: false
   },
   {
    from: 32,
    to: 23,
    takes: 1,
    promo: false
   },
   {
    from: 8,
    to: 12,
    takes: 0,
    promo: false
   },
   {
    from: 30,
    to: 19,
    takes: 1,
    promo: false
   },
   {
    from: 20,
    to: 24,
    takes: 0,
    promo: false
   },
   {
    from: 19,
    to: 30,
    takes: 1,
    promo: false
   },
   {
    from: 14,
    to: 20,
    takes: 0,
    promo: false
   },
   {
    from: 25,
    to: 14,
    takes: 1,
    promo: false
   },
   {
    from: 10,
    to: 28,
    takes: 2,
    promo: false
   },
   {
    from: 30,
    to: 24,
    takes: 0,
    promo: false
   },
   {
    from: 12,
    to: 18,
    takes: 0,
    promo: false
   },
   {
    from: 24,
    to: 19,
    takes: 0,
    promo: false
   },
   {
    from: 27,
    to: 31,
    takes: 0,
    promo: false
   },
   {
    from: 36,
    to: 27,
    takes: 1,
    promo: false
   },
   {
    from: 21,
    to: 41,
    takes: 2,
    promo: false
   },
   {
    from: 42,
    to: 37,
    takes: 0,
    promo: false
   },
   {
    from: 41,
    to: 32,
    takes: 1,
    promo: false
   },
   {
    from: 38,
    to: 27,
    takes: 1,
    promo: false
   },
   {
    from: 22,
    to: 31,
    takes: 1,
    promo: false
   },
   {
    from: 33,
    to: 13,
    takes: 2,
    promo: false
   },
   {
    from: 5,
    to: 10,
    takes: 0,
    promo: false
   }
  ],
  notes: {
   "0": "La partie qui fit de Gantwarg un champion d'URSS — considérée comme l'une des plus belles de sa carrière.",
   "77": "La partie s'achève ici — l'avantage blanc est décisif."
  }
 },
 {
  id: "tchegolev1974",
  guessSide: "w",
  white: "Viacheslav Shchegolev",
  black: "Kolodiev",
  event: "Championnat d'URSS, 1974",
  theme: "Partie de championnat",
  intro: "Tirée des chroniques de Ton Sijbrands : Shchegolev, double champion du monde, au travail.",
  moves: [
   {
    from: 32,
    to: 28,
    takes: 0,
    promo: false
   },
   {
    from: 18,
    to: 23,
    takes: 0,
    promo: false
   },
   {
    from: 34,
    to: 29,
    takes: 0,
    promo: false
   },
   {
    from: 23,
    to: 32,
    takes: 1,
    promo: false
   },
   {
    from: 37,
    to: 28,
    takes: 1,
    promo: false
   },
   {
    from: 12,
    to: 18,
    takes: 0,
    promo: false
   },
   {
    from: 41,
    to: 37,
    takes: 0,
    promo: false
   },
   {
    from: 16,
    to: 21,
    takes: 0,
    promo: false
   },
   {
    from: 31,
    to: 26,
    takes: 0,
    promo: false
   },
   {
    from: 19,
    to: 23,
    takes: 0,
    promo: false
   },
   {
    from: 28,
    to: 19,
    takes: 1,
    promo: false
   },
   {
    from: 14,
    to: 34,
    takes: 2,
    promo: false
   },
   {
    from: 40,
    to: 29,
    takes: 1,
    promo: false
   },
   {
    from: 21,
    to: 27,
    takes: 0,
    promo: false
   },
   {
    from: 45,
    to: 40,
    takes: 0,
    promo: false
   },
   {
    from: 7,
    to: 12,
    takes: 0,
    promo: false
   },
   {
    from: 40,
    to: 34,
    takes: 0,
    promo: false
   },
   {
    from: 10,
    to: 14,
    takes: 0,
    promo: false
   },
   {
    from: 44,
    to: 40,
    takes: 0,
    promo: false
   },
   {
    from: 1,
    to: 7,
    takes: 0,
    promo: false
   },
   {
    from: 46,
    to: 41,
    takes: 0,
    promo: false
   },
   {
    from: 5,
    to: 10,
    takes: 0,
    promo: false
   },
   {
    from: 37,
    to: 31,
    takes: 0,
    promo: false
   },
   {
    from: 17,
    to: 22,
    takes: 0,
    promo: false
   },
   {
    from: 41,
    to: 37,
    takes: 0,
    promo: false
   },
   {
    from: 20,
    to: 25,
    takes: 0,
    promo: false
   },
   {
    from: 38,
    to: 32,
    takes: 0,
    promo: false
   },
   {
    from: 27,
    to: 38,
    takes: 1,
    promo: false
   },
   {
    from: 43,
    to: 32,
    takes: 1,
    promo: false
   },
   {
    from: 14,
    to: 19,
    takes: 0,
    promo: false
   },
   {
    from: 42,
    to: 38,
    takes: 0,
    promo: false
   },
   {
    from: 19,
    to: 23,
    takes: 0,
    promo: false
   },
   {
    from: 47,
    to: 41,
    takes: 0,
    promo: false
   },
   {
    from: 11,
    to: 17,
    takes: 0,
    promo: false
   },
   {
    from: 48,
    to: 43,
    takes: 0,
    promo: false
   },
   {
    from: 23,
    to: 28,
    takes: 0,
    promo: false
   },
   {
    from: 32,
    to: 23,
    takes: 1,
    promo: false
   },
   {
    from: 6,
    to: 11,
    takes: 0,
    promo: false
   },
   {
    from: 23,
    to: 19,
    takes: 0,
    promo: false
   },
   {
    from: 13,
    to: 24,
    takes: 1,
    promo: false
   },
   {
    from: 29,
    to: 20,
    takes: 1,
    promo: false
   },
   {
    from: 25,
    to: 14,
    takes: 1,
    promo: false
   },
   {
    from: 37,
    to: 32,
    takes: 0,
    promo: false
   },
   {
    from: 9,
    to: 13,
    takes: 0,
    promo: false
   },
   {
    from: 50,
    to: 45,
    takes: 0,
    promo: false
   },
   {
    from: 3,
    to: 9,
    takes: 0,
    promo: false
   },
   {
    from: 41,
    to: 37,
    takes: 0,
    promo: false
   },
   {
    from: 15,
    to: 20,
    takes: 0,
    promo: false
   },
   {
    from: 34,
    to: 29,
    takes: 0,
    promo: false
   },
   {
    from: 20,
    to: 25,
    takes: 0,
    promo: false
   },
   {
    from: 32,
    to: 28,
    takes: 0,
    promo: false
   },
   {
    from: 22,
    to: 27,
    takes: 0,
    promo: false
   },
   {
    from: 31,
    to: 22,
    takes: 1,
    promo: false
   },
   {
    from: 18,
    to: 27,
    takes: 1,
    promo: false
   },
   {
    from: 38,
    to: 32,
    takes: 0,
    promo: false
   },
   {
    from: 27,
    to: 38,
    takes: 1,
    promo: false
   },
   {
    from: 43,
    to: 32,
    takes: 1,
    promo: false
   },
   {
    from: 14,
    to: 20,
    takes: 0,
    promo: false
   },
   {
    from: 49,
    to: 43,
    takes: 0,
    promo: false
   },
   {
    from: 10,
    to: 15,
    takes: 0,
    promo: false
   },
   {
    from: 43,
    to: 38,
    takes: 0,
    promo: false
   },
   {
    from: 9,
    to: 14,
    takes: 0,
    promo: false
   },
   {
    from: 40,
    to: 34,
    takes: 0,
    promo: false
   },
   {
    from: 14,
    to: 19,
    takes: 0,
    promo: false
   },
   {
    from: 29,
    to: 23,
    takes: 0,
    promo: false
   },
   {
    from: 19,
    to: 24,
    takes: 0,
    promo: false
   },
   {
    from: 23,
    to: 18,
    takes: 0,
    promo: false
   },
   {
    from: 13,
    to: 22,
    takes: 1,
    promo: false
   },
   {
    from: 26,
    to: 21,
    takes: 0,
    promo: false
   },
   {
    from: 17,
    to: 26,
    takes: 1,
    promo: false
   },
   {
    from: 28,
    to: 6,
    takes: 2,
    promo: false
   },
   {
    from: 7,
    to: 11,
    takes: 0,
    promo: false
   },
   {
    from: 6,
    to: 17,
    takes: 1,
    promo: false
   },
   {
    from: 12,
    to: 21,
    takes: 1,
    promo: false
   },
   {
    from: 36,
    to: 31,
    takes: 0,
    promo: false
   }
  ],
  notes: {
   "0": "Tirée des chroniques de Ton Sijbrands : Shchegolev, double champion du monde, au travail.",
   "74": "La partie s'achève ici, sur une position tendue."
  }
 }
];

export function gameById(id) {
  return GAMES.find((g) => g.id === id);
}
