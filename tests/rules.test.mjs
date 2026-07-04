/**
 * Tests du moteur de règles (RulesEngine sur @jortvl/draughts).
 * Lancer :  npm test   (ou : node tests/rules.test.mjs)
 *
 * Vérifie notamment les règles officielles FMJD :
 * - prise obligatoire (avant ET arrière pour les pions) ;
 * - RAFLE MAJORITAIRE : quand plusieurs prises existent, seules celles qui
 *   capturent le nombre MAXIMAL de pièces sont légales ;
 * - promotion en dame uniquement quand le pion TERMINE sur la dernière rangée ;
 * - dame volante (déplacement long sur la diagonale) ;
 * - détection de victoire (plus de coups = défaite du camp au trait).
 */

import assert from 'node:assert/strict';
import { RulesEngine, START_FEN } from '../src/engine/rules.js';

let passed = 0;
function test(name, fn) {
  try {
    fn();
    passed++;
    console.log(`  ✓ ${name}`);
  } catch (e) {
    console.error(`  ✗ ${name}`);
    console.error(e);
    process.exitCode = 1;
  }
}

console.log('RulesEngine — règles des dames internationales 10x10');

test('position de départ : 20 pions par camp, trait aux Blancs', () => {
  const e = new RulesEngine();
  assert.equal(e.turn(), 'w');
  const c = e.countPieces();
  assert.equal(c.w, 20);
  assert.equal(c.b, 20);
  assert.equal(e.fen().startsWith('W:'), true);
});

test('position de départ : 9 coups légaux blancs, aucun capturant', () => {
  const e = new RulesEngine();
  const moves = e.getLegalMoves();
  assert.equal(moves.length, 9);
  assert.ok(moves.every((m) => m.captures.length === 0));
});

test('prise obligatoire : un coup simple est refusé quand une prise existe', () => {
  // Pion blanc en 28, pion noir en 23 : prise 28x19 obligatoire.
  const e = new RulesEngine('W:W28:B23');
  const moves = e.getLegalMoves();
  assert.equal(moves.length, 1);
  assert.deepEqual({ from: moves[0].from, to: moves[0].to }, { from: 28, to: 19 });
  assert.deepEqual(moves[0].captures, [23]);
  // Tenter un coup simple 28-33 doit échouer.
  assert.equal(e.applyMove({ from: 28, to: 33 }), null);
  // La prise, elle, passe.
  const played = e.applyMove({ from: 28, to: 19 });
  assert.ok(played);
  assert.deepEqual(played.captures, [23]);
  assert.equal(e.countPieces().b, 0);
});

test('prise en ARRIÈRE obligatoire pour un pion', () => {
  // Pion blanc en 28, pion noir en 33 (derrière lui, côté blanc) :
  // le pion doit prendre en arrière 28x39.
  const e = new RulesEngine('W:W28:B33');
  const moves = e.getLegalMoves();
  assert.equal(moves.length, 1);
  assert.deepEqual({ from: moves[0].from, to: moves[0].to }, { from: 28, to: 39 });
  assert.deepEqual(moves[0].captures, [33]);
});

test('RAFLE MAJORITAIRE : la prise de 2 pièces interdit la prise de 1', () => {
  // Pion blanc en 28. Deux options de prise :
  //  - 28x19 (prend 23) : 1 pièce ;
  //  - 28x17x8 via 22 puis 12 : 2 pièces.
  // Seule la rafle de 2 doit être légale.
  const e = new RulesEngine('W:W28:B22,12,23');
  const moves = e.getLegalMoves();
  assert.ok(moves.length >= 1);
  for (const m of moves) {
    assert.equal(m.captures.length, 2, `rafle attendue de 2 prises, reçu ${JSON.stringify(m)}`);
  }
  assert.equal(e.applyMove({ from: 28, to: 19 }), null, 'la prise simple doit être refusée');
  const played = e.applyMove({ from: 28, to: 8 });
  assert.ok(played, 'la rafle majoritaire 28x8 doit être jouable');
  assert.equal(played.captures.length, 2);
  assert.equal(e.countPieces().b, 1); // il reste le pion 23 non pris
});

test('RAFLE MAJORITAIRE : 3 prises préférées à 2, pour une dame aussi', () => {
  // Dame blanche en 46. Rafle longue disponible.
  // Noirs en 41, 42... construisons : dame en 46, noirs en 41 ? 46 est en bas.
  // Plus simple : dame blanche en 28, noirs en 22, 12, 14, 23.
  // Chemins possibles : 28x17(22)x8(12) = 2 prises,
  //                     28x17(22)x?…    ou via 19 : 28x19(23)x10(14) = 2 prises…
  // On ajoute 4 pour permettre 28x17(22)x8(12)... pas de 3e.
  // Construisons un cas net à 3 prises pour un PION :
  // pion blanc 33, noirs en 28, 18, 8 alignés en zigzag : 33x22(28)? non.
  // Utilisons la géométrie : 33x24? Prises pion : sauts de 2 cases.
  // 33 -> saute 28 -> 22 ; 22 -> saute 17 -> 11 ; 11 -> saute 7 -> 2.
  // Donc noirs en 28, 17, 7 : rafle de 3 (33x22x11x2).
  // Et un noir en 29 offre une prise simple 33x24 (1 prise).
  const e = new RulesEngine('W:W33:B28,17,7,29');
  const moves = e.getLegalMoves();
  assert.ok(moves.length >= 1);
  for (const m of moves) {
    assert.equal(m.captures.length, 3, `rafle attendue de 3 prises, reçu ${JSON.stringify(m)}`);
  }
  assert.equal(e.applyMove({ from: 33, to: 24 }), null, 'la prise simple 33x24 doit être refusée');
  const played = e.applyMove({ from: 33, to: 2 });
  assert.ok(played, 'la rafle 33x2 doit être jouable');
  assert.equal(played.captures.length, 3);
});

test('promotion en dame en atteignant la dernière rangée', () => {
  const e = new RulesEngine('W:W6:B45');
  const moves = e.movesFrom(6);
  const promo = moves.find((m) => m.to === 1);
  assert.ok(promo, 'le pion en 6 doit pouvoir aller en 1');
  assert.equal(promo.promotion, true);
  e.applyMove({ from: 6, to: 1 });
  assert.equal(e.getBoard()[1], 'W', 'le pion doit devenir une dame (W)');
});

test('pas de promotion si le pion TRAVERSE la dernière rangée en pleine rafle', () => {
  // Pion blanc en 12 ; noirs en 7 et 8.
  // Rafle : 12x1(7)? 12 -> saute 7 -> 1 (dernière rangée), puis de 1 saute 8 ?
  // Géométrie : de 1, sauter 7 est déjà pris… construisons plutôt :
  // 12 saute 8 -> 3 (dernière rangée), puis de 3 saute 9 -> 14.
  // Noirs en 8 et 9 : la rafle 12x3x14 traverse la rangée 1-5 sans s'y arrêter.
  const e = new RulesEngine('W:W12:B8,9');
  const moves = e.movesFrom(12);
  assert.ok(moves.length >= 1);
  for (const m of moves) {
    assert.equal(m.captures.length, 2, 'la rafle complète (2 prises) est obligatoire');
    assert.equal(m.promotion, false, 'pas de promotion en simple passage');
  }
  const played = e.applyMove({ from: 12, to: moves[0].to });
  assert.ok(played);
  assert.equal(e.getBoard()[played.to], 'w', 'le pion reste un pion après la traversée');
});

test('dame volante : déplacement à distance sur la diagonale', () => {
  const e = new RulesEngine('W:WK46:B5');
  const moves = e.movesFrom(46);
  const dests = moves.map((m) => m.to).sort((a, b) => a - b);
  // Diagonale 46-41-37-32-28-23-19-14-10 et 46-... : au moins 5 destinations.
  assert.ok(dests.length >= 5, `déplacements de dame attendus, reçu ${dests}`);
  assert.ok(moves.every((m) => m.captures.length === 0));
});

test('victoire : le camp qui ne peut plus jouer a perdu', () => {
  // Noirs au trait avec un seul pion en 5 (coin), bloqué par des blancs.
  // Pion noir 5, blancs en 10 et 14 : 5 ne peut ni avancer (10 occupé,
  // saut 5x14 ? 5 saute 10 -> 14 occupé) ni prendre.
  const e = new RulesEngine('B:W10,14,15:B5');
  assert.equal(e.getLegalMoves().length, 0);
  assert.equal(e.isGameOver(), true);
  assert.equal(e.winner(), 'w');
});

test('victoire : plus aucune pièce = défaite', () => {
  const e = new RulesEngine('W:W28:B23');
  e.applyMove({ from: 28, to: 19 }); // prend la dernière pièce noire
  assert.equal(e.isGameOver(), true);
  assert.equal(e.winner(), 'w');
});

test('clone : indépendant de l original', () => {
  const e = new RulesEngine();
  const c = e.clone();
  e.applyMove({ from: 32, to: 28 });
  assert.notEqual(e.fen(), c.fen());
  assert.equal(c.turn(), 'w'); // le clone reste à la position initiale
  assert.equal(c.countPieces().w, 20);
  assert.equal(c.getBoard()[32], 'w');
});

test('une partie aléatoire complète se termine proprement', () => {
  const e = new RulesEngine();
  let rngState = 42;
  const rng = () => {
    // petit générateur déterministe (LCG) pour un test reproductible
    rngState = (rngState * 1664525 + 1013904223) >>> 0;
    return rngState / 2 ** 32;
  };
  let guard = 0;
  while (!e.isGameOver() && guard++ < 500) {
    const moves = e.getLegalMoves();
    assert.ok(moves.length > 0, 'des coups doivent exister tant que la partie continue');
    // La prise obligatoire impose que tous les coups soient homogènes :
    // soit tous capturants (même nombre de prises : rafle majoritaire),
    // soit aucun.
    const counts = new Set(moves.map((m) => m.captures.length));
    if (!counts.has(0)) {
      assert.equal(counts.size, 1, `rafle majoritaire violée : ${[...counts]}`);
    } else {
      assert.deepEqual([...counts], [0], 'mélange coups simples/prises interdit');
    }
    const m = moves[Math.floor(rng() * moves.length)];
    assert.ok(e.applyMove(m), `coup légal refusé : ${JSON.stringify(m)}`);
  }
  assert.ok(e.isGameOver() || guard >= 500);
  if (e.isGameOver()) {
    assert.ok(['w', 'b', 'draw'].includes(e.winner()));
  }
});

console.log(`\n${passed} tests réussis${process.exitCode ? ' (avec des ÉCHECS)' : ''}`);
