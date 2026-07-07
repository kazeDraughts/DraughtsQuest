/**
 * Test de niveau initial : la table de placement est cohérente.
 * Lancer : node tests/placement.test.mjs
 */

import assert from 'node:assert/strict';
import { PLACEMENT_STEPS, placementResult, placementSkipsTutorial } from '../src/career/placement.js';
import { AI_LEVELS } from '../src/ai/levels.js';

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

console.log('Test de niveau — table de placement');

test('les adversaires d\'examen existent et montent en force', () => {
  let prev = 0;
  for (const id of PLACEMENT_STEPS) {
    assert.ok(AI_LEVELS[id], `niveau inconnu : ${id}`);
    assert.ok(AI_LEVELS[id].elo > prev, 'les examens doivent monter en force');
    prev = AI_LEVELS[id].elo;
  }
});

test('victoire = partie suivante, sauf la dernière', () => {
  assert.deepEqual(placementResult(0, 'win'), { done: false, nextStep: 1 });
  assert.deepEqual(placementResult(1, 'win'), { done: false, nextStep: 2 });
  const final = placementResult(2, 'win');
  assert.ok(final.done && final.elo === 1550);
});

test('défaites et nulles arrêtent le test avec un Elo croissant', () => {
  const ladder = [
    placementResult(0, 'lose').elo,  // 700
    placementResult(0, 'draw').elo,  // 850
    placementResult(1, 'lose').elo,  // 1000
    placementResult(1, 'draw').elo,  // 1100
    placementResult(2, 'lose').elo,  // 1250
    placementResult(2, 'draw').elo,  // 1400
    placementResult(2, 'win').elo,   // 1550
  ];
  for (let i = 1; i < ladder.length; i++) {
    assert.ok(ladder[i] > ladder[i - 1], `échelle non croissante à ${i} (${ladder.join(',')})`);
  }
  assert.equal(ladder[0], 700, 'une défaite d\'entrée = le départ standard');
});

test('le tutoriel est sauté dès une victoire prouvée', () => {
  assert.equal(placementSkipsTutorial(700, 0), false);
  assert.equal(placementSkipsTutorial(850, 0), false); // nulle d'entrée : leçon utile
  assert.equal(placementSkipsTutorial(1000, 1), true);
  assert.equal(placementSkipsTutorial(1550, 3), true);
});

console.log(`\n${passed} tests réussis${process.exitCode ? ' (avec des ÉCHECS)' : ''}`);
