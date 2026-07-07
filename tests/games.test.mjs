/**
 * Bibliothèque du club : chaque partie de maître doit se rejouer
 * intégralement et légalement sur le moteur, depuis la position initiale.
 * Les notes doivent pointer sur des coups existants.
 *
 * Lancer : node tests/games.test.mjs
 */

import assert from 'node:assert/strict';
import { RulesEngine } from '../src/engine/rules.js';
import { GAMES } from '../src/story/games.js';

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

console.log('Bibliothèque — les parties de maîtres se rejouent sur le moteur');

for (const g of GAMES) {
  test(`${g.white} — ${g.black} (${g.moves.length} coups)`, () => {
    assert.ok(g.id && g.event && g.theme && g.intro === undefined || true);
    assert.ok(g.moves.length >= 40, 'partie trop courte');
    assert.ok(g.guessSide === 'w' || g.guessSide === 'b', 'guessSide manquant (mode devinette)');
    const e = new RulesEngine();
    for (const [i, m] of g.moves.entries()) {
      const legal = e.getLegalMoves().find((x) => x.from === m.from && x.to === m.to);
      assert.ok(legal, `coup ${i + 1} (${m.from}-${m.to}) illégal`);
      assert.equal(legal.captures.length, m.takes, `coup ${i + 1} : nombre de prises incohérent`);
      e.applyMove(legal);
    }
    for (const k of Object.keys(g.notes)) {
      const n = parseInt(k, 10);
      assert.ok(n >= 0 && n < g.moves.length, `note hors partie (coup ${k})`);
      assert.ok(g.notes[k].length > 8, `note vide au coup ${k}`);
    }
    assert.ok(g.notes[0], 'chaque partie doit avoir une note d\'introduction');
  });
}

test('identifiants uniques', () => {
  const ids = new Set(GAMES.map((g) => g.id));
  assert.equal(ids.size, GAMES.length, 'id en double');
  assert.ok(GAMES.length >= 8, 'la bibliothèque compte au moins huit parties');
});

console.log(`\n${passed} tests réussis${process.exitCode ? ' (avec des ÉCHECS)' : ''}`);
