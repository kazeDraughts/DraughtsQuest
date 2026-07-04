/**
 * Tests de l'IA (minimax alpha-bêta).
 * Lancer : node tests/ai.test.mjs
 */

import assert from 'node:assert/strict';
import { RulesEngine } from '../src/engine/rules.js';
import { findBestMove } from '../src/ai/search.js';
import { evaluate } from '../src/ai/evaluate.js';

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

console.log('IA — minimax alpha-bêta');

test('déterministe à graine fixée', () => {
  const a = findBestMove('W:W31-50:B1-20', { maxDepth: 3, timeMs: 5000, noise: 30 }, 123);
  const b = findBestMove('W:W31-50:B1-20', { maxDepth: 3, timeMs: 5000, noise: 30 }, 123);
  assert.deepEqual({ from: a.move.from, to: a.move.to }, { from: b.move.from, to: b.move.to });
});

test('joue la rafle gagnante (2 prises)', () => {
  const r = findBestMove('W:W28:B22,12,23', { maxDepth: 3, timeMs: 3000 }, 7);
  assert.deepEqual({ from: r.move.from, to: r.move.to }, { from: 28, to: 8 });
});

test('évite le coup perdant : ne se jette pas sous une rafle', () => {
  // Blancs : pions 33 et 44. Noirs : pions 22 et 21.
  // 33-28 ?? offrirait 22x33... vérifions plutôt par comparaison de scores :
  // à profondeur 4, le coup choisi ne doit pas laisser les Noirs gagner du
  // matériel net au coup suivant.
  const fen = 'W:W33,34,40,45,50:B12,13,14,20';
  const r = findBestMove(fen, { maxDepth: 4, timeMs: 4000 }, 11);
  assert.ok(r.move, 'un coup doit être trouvé');
  const e = new RulesEngine(fen);
  e.applyMove(r.move);
  const reply = e.getLegalMoves();
  const worstLoss = Math.max(0, ...reply.map((m) => m.captures.length));
  // Aucune réponse noire ne doit capturer plus d'une pièce blanche gratuite.
  assert.ok(worstLoss <= 1, `le coup ${r.move.from}-${r.move.to} laisse une rafle de ${worstLoss}`);
});

test('profondeur atteinte raisonnable dans le budget temps', () => {
  const r = findBestMove('W:W31-50:B1-20', { maxDepth: 12, timeMs: 1000 }, 3);
  console.log(`    profondeur ${r.depth}, ${r.nodes} nœuds en ${r.ms} ms (${Math.round(r.nodes / (r.ms / 1000))} n/s)`);
  assert.ok(r.depth >= 4, `profondeur ${r.depth} trop faible en 1 s`);
});

test('le niveau fort bat le niveau faible (mini-match)', function () {
  // Match rapide : Blancs = fort (profondeur 6), Noirs = faible (profondeur 1
  // très bruité). Budgets serrés pour garder le test rapide.
  const e = new RulesEngine();
  const strong = { maxDepth: 6, timeMs: 250, noise: 0, blunder: 0 };
  const weak = { maxDepth: 1, timeMs: 60, noise: 120, blunder: 0.4 };
  let plies = 0;
  while (!e.isGameOver() && plies++ < 160) {
    const cfg = e.turn() === 'w' ? strong : weak;
    const { move } = findBestMove(e.fen(), cfg, 1000 + plies);
    if (!move) break;
    e.applyMove(move);
  }
  const c = e.countPieces();
  const material = (c.w + 3 * c.W) - (c.b + 3 * c.B);
  const winner = e.isGameOver() ? e.winner() : null;
  console.log(`    ${plies} demi-coups, matériel (blanc-noir) = ${material}, vainqueur = ${winner ?? 'partie tronquée'}`);
  assert.ok(winner === 'w' || material >= 3,
    `l'IA forte devrait dominer (vainqueur=${winner}, matériel=${material})`);
});

test('évaluation symétrique à la position de départ', () => {
  const e = new RulesEngine();
  assert.equal(evaluate(e.getBoard()), 0);
});

console.log(`\n${passed} tests réussis${process.exitCode ? ' (avec des ÉCHECS)' : ''}`);
