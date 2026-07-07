/**
 * Proposition de nulle : la décision de l'IA est cohérente.
 * Lancer : node tests/drawoffer.test.mjs
 */

import assert from 'node:assert/strict';
import { aiAcceptsDraw, MIN_DRAW_PLIES, DRAW_RETRY_PLIES } from '../src/game/drawoffer.js';

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

console.log('Proposition de nulle — décision de l\'IA');

test('jamais de nulle trop tôt, quel que soit le score', () => {
  for (const aiScore of [-500, 0, 500]) {
    assert.deepEqual(aiAcceptsDraw({ aiScore, aiElo: 1200, plies: MIN_DRAW_PLIES - 1 }),
      { accept: false, reason: 'early' });
  }
});

test('l\'IA refuse quand elle est nettement mieux', () => {
  assert.equal(aiAcceptsDraw({ aiScore: 300, aiElo: 1200, plies: 40 }).accept, false);
  assert.equal(aiAcceptsDraw({ aiScore: 300, aiElo: 600, plies: 40 }).reason, 'winning');
});

test('l\'IA accepte une position équilibrée ou inférieure', () => {
  assert.equal(aiAcceptsDraw({ aiScore: 0, aiElo: 2000, plies: 40 }).accept, true);
  assert.equal(aiAcceptsDraw({ aiScore: -250, aiElo: 2000, plies: 40 }).accept, true);
});

test('plus l\'IA est forte, plus elle est exigeante', () => {
  const score = 50; // un demi-pion d'avance pour l'IA
  assert.equal(aiAcceptsDraw({ aiScore: score, aiElo: 600, plies: 40 }).accept, true);   // bon public
  assert.equal(aiAcceptsDraw({ aiScore: score, aiElo: 1200, plies: 40 }).accept, true);  // seuil 60
  assert.equal(aiAcceptsDraw({ aiScore: score, aiElo: 2000, plies: 40 }).accept, false); // grand maître
});

test('constantes saines', () => {
  assert.ok(MIN_DRAW_PLIES >= 20 && DRAW_RETRY_PLIES >= 4);
});

console.log(`\n${passed} tests réussis${process.exitCode ? ' (avec des ÉCHECS)' : ''}`);
