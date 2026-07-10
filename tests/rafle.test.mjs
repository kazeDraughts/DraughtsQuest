/**
 * Rafles pas-à-pas : le module d'aide reconstruit correctement le chemin
 * d'une rafle, saut après saut, et l'achève sur le bon coup.
 * Lancer : node tests/rafle.test.mjs
 */

import assert from 'node:assert/strict';
import { RulesEngine } from '../src/engine/rules.js';
import {
  isRafleFrom, rafleStart, rafleNextHops, rafleAdvance, rafleBoard,
} from '../src/game/rafle.js';

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

console.log('Rafles pas-à-pas — module d\'aide au chemin');

test('détecte une rafle (≥2 prises) mais pas une prise simple', () => {
  const rafle = new RulesEngine('W:W35:B18,19,28,30').getLegalMoves();
  assert.equal(isRafleFrom(rafle, 35), true);
  const simple = new RulesEngine('W:W40:B34').getLegalMoves(); // 40x29 : 1 prise
  assert.equal(simple[0].captures.length, 1);
  assert.equal(isRafleFrom(simple, 40), false);
});

test('rejoue une rafle de 4 saut par saut jusqu\'au coup complet', () => {
  const engine = new RulesEngine('W:W35:B18,19,28,30');
  const moves = engine.getLegalMoves();
  // chemin attendu : 35 -> 24 -> 13 -> 22 -> 33 (prises 30,19,18,28)
  let state = rafleStart(moves, 35);
  const path = [24, 13, 22, 33];
  const captured = [30, 19, 18, 28];
  for (let i = 0; i < path.length; i++) {
    const hops = rafleNextHops(state);
    assert.ok(hops.some((h) => h.to === path[i]), `saut ${path[i]} absent des options`);
    const hop = hops.find((h) => h.to === path[i]);
    assert.equal(hop.capture, captured[i], `mauvaise pièce prise au saut ${i + 1}`);
    const res = rafleAdvance(state, path[i]);
    assert.ok(res.ok, `saut ${path[i]} refusé`);
    if (i < path.length - 1) {
      assert.equal(res.done, false);
      state = res.state;
    } else {
      assert.equal(res.done, true, 'la rafle aurait dû s\'achever');
      assert.equal(res.move.from, 35);
      assert.equal(res.move.to, 33);
      assert.equal(res.move.captures.length, 4);
    }
  }
});

test('un saut hors chemin est refusé', () => {
  const engine = new RulesEngine('W:W35:B18,19,28,30');
  const state = rafleStart(engine.getLegalMoves(), 35);
  assert.deepEqual(rafleAdvance(state, 40), { ok: false });
  assert.deepEqual(rafleAdvance(state, 33), { ok: false }); // la case finale n'est pas le 1er saut
});

test('les chemins qui divergent (dame) proposent bien les deux fins', () => {
  // Dame 46 rafle 28,19 puis peut finir en 14 OU 10 (jumps [46,23,14]/[46,23,10])
  const engine = new RulesEngine('W:WK46:B28,19,5');
  let state = rafleStart(engine.getLegalMoves(), 46);
  const r1 = rafleAdvance(state, 23);
  assert.ok(r1.ok && !r1.done, 'le 1er saut 46->23 devrait continuer');
  state = r1.state;
  const finals = rafleNextHops(state).map((h) => h.to).sort((a, b) => a - b);
  assert.deepEqual(finals, [10, 14], 'les deux fins de rafle devraient être proposées');
  const done = rafleAdvance(state, 10);
  assert.ok(done.ok && done.done && done.move.to === 10);
});

test('le damier intermédiaire déplace la pièce et retire les pièces prises', () => {
  const engine = new RulesEngine('W:W35:B18,19,28,30');
  let state = rafleStart(engine.getLegalMoves(), 35);
  state = rafleAdvance(state, 24).state; // a sauté 30
  const board = rafleBoard(engine.getBoard(), state);
  assert.equal(board[35], null, 'la pièce a quitté la case de départ');
  assert.equal(board[24], 'w', 'la pièce est sur la case courante');
  assert.equal(board[30], null, 'la pièce sautée a disparu');
  assert.equal(board[19], 'b', 'les pièces pas encore prises restent');
  // le vrai moteur n'a PAS bougé (rafleBoard est purement visuel)
  assert.equal(engine.getBoard()[35], 'w');
});

console.log(`\n${passed} tests réussis${process.exitCode ? ' (avec des ÉCHECS)' : ''}`);
