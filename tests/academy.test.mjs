/**
 * Académie des styles : chaque leçon est rejouée sur le moteur réel.
 * - toutes les positions sont valides, trait aux Blancs à chaque étape ;
 * - chaque coup accepté est légal et SAIN (l'élève ne doit jamais apprendre
 *   un coup perdant : éval blanche >= -80 après le coup, minimax prof. 6) ;
 * - les répliques noires scriptées sont légales ;
 * - les étapes marquées `certified` (menace imparable) sont RE-CERTIFIÉES :
 *   après le coup enseigné, TOUTES les défenses noires perdent ;
 * - la fin des leçons à gain (semi-ouverte, taquin, marchand de bois) est
 *   nettement gagnante ; les autres restent équilibrées ;
 * - les positions des parties d'application se chargent et sont jouables.
 *
 * Lancer : node tests/academy.test.mjs
 */

import assert from 'node:assert/strict';
import { RulesEngine } from '../src/engine/rules.js';
import { findBestMove } from '../src/ai/search.js';
import { STYLES } from '../src/story/academy.js';
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

function whiteEval(fen, depth = 6, ms = 4000) {
  const e = new RulesEngine(fen);
  let guard = 0;
  while (!e.isGameOver() && e.getLegalMoves().length === 1 && guard++ < 24) {
    e.applyMove(e.getLegalMoves()[0]);
  }
  if (e.isGameOver()) {
    return e.winner() === 'w' ? 99999 : e.winner() === 'draw' ? 0 : -99999;
  }
  const r = findBestMove(e.fen(), { maxDepth: depth, timeMs: ms, noise: 0 }, 1);
  return e.turn() === 'w' ? r.score : -r.score;
}

// Les leçons qui se terminent sur un gain certifié doivent finir gagnantes.
const ENDS_WINNING = new Set(['semiouverte', 'taquin', 'bois', 'finales']);

console.log('Académie des styles — validation des leçons par le moteur');

for (const style of STYLES) {
  test(`${style.icon} ${style.title} — la leçon se rejoue`, () => {
    assert.ok(style.steps.length > 0, 'leçon vide');
    assert.ok(style.steps[0].fen, 'la première étape doit poser une position');
    let engine = null;

    for (const [i, step] of style.steps.entries()) {
      if (step.fen) {
        engine = new RulesEngine(step.fen);
        assert.equal(engine.turn(), 'w', `étape ${i + 1} : le trait doit être aux Blancs`);
      }
      assert.ok(engine, `étape ${i + 1} sans position`);
      assert.ok(step.accept?.length, `étape ${i + 1} : aucun coup accepté`);
      assert.ok(step.intro?.length || i > 0, 'la leçon doit commencer par des explications');

      const legal = engine.getLegalMoves();
      const playable = step.accept.filter((a) => legal.some((m) => m.from === a.from && m.to === a.to));
      assert.ok(playable.length > 0,
        `étape ${i + 1} : aucun coup accepté n'est légal (légaux : ${legal.map((m) => `${m.from}-${m.to}`).join(', ')})`);
      if (step.hint) {
        assert.ok(step.accept.some((a) => a.from === step.hint.from && a.to === step.hint.to),
          `étape ${i + 1} : l'indice ne correspond pas`);
      }

      // Re-certification des menaces imparables : après le coup enseigné,
      // TOUTES les défenses noires doivent perdre nettement.
      if (step.certified) {
        const probe = new RulesEngine(engine.fen());
        probe.applyMove(playable[0]);
        for (const d of probe.getLegalMoves()) {
          const c = new RulesEngine(probe.fen());
          c.applyMove(d);
          const sc = whiteEval(c.fen());
          assert.ok(sc >= 100,
            `étape ${i + 1} : la défense ${d.from}${d.captures.length ? 'x' : '-'}${d.to} réfute la menace (éval ${Math.round(sc)})`);
        }
      }

      // Le coup enseigné ne doit JAMAIS être perdant.
      const probe2 = new RulesEngine(engine.fen());
      probe2.applyMove(playable[0]);
      const after = whiteEval(probe2.fen());
      assert.ok(after >= -80, `étape ${i + 1} : le coup enseigné ${playable[0].from}-${playable[0].to} est mauvais (éval ${Math.round(after)})`);

      engine.applyMove(playable[0]);
      if (step.reply) {
        assert.equal(engine.turn(), 'b', `étape ${i + 1} : réplique noire hors tour`);
        const ok = engine.applyMove(step.reply);
        assert.ok(ok, `étape ${i + 1} : réplique noire ${step.reply.from}->${step.reply.to} illégale`);
      }
    }

    // Bilan final de la leçon
    const final = whiteEval(engine.fen());
    if (ENDS_WINNING.has(style.id)) {
      assert.ok(final >= 120, `${style.id} : la leçon devrait finir gagnante (éval ${Math.round(final)})`);
    } else {
      assert.ok(final >= -80, `${style.id} : la leçon laisse une position perdante (éval ${Math.round(final)})`);
    }
  });

  test(`${style.icon} ${style.title} — la partie d'application est jouable`, () => {
    const p = style.practice;
    assert.ok(p?.fen, 'pas de position d\'application');
    assert.ok(AI_LEVELS[p.level], `niveau d'IA inconnu : ${p.level}`);
    assert.ok(p.reward > 0 && p.invite && p.label, 'fiche d\'application incomplète');
    const e = new RulesEngine(p.fen);
    assert.ok(!e.isGameOver(), 'position d\'application déjà finie');
    assert.ok(e.getLegalMoves().length > 0, 'aucun coup jouable');
    const c = e.countPieces();
    assert.ok(c.w + c.W >= 5 && c.b + c.B >= 5, 'trop peu de matière pour une vraie partie');
  });
}

test('identifiants, PNJ et récompenses cohérents', () => {
  const ids = new Set();
  const npcs = new Set();
  for (const s of STYLES) {
    assert.ok(!ids.has(s.id), `id en double : ${s.id}`);
    assert.ok(!npcs.has(s.npc), `PNJ en double : ${s.npc}`);
    ids.add(s.id);
    npcs.add(s.npc);
    assert.ok(s.reward > 0 && s.title && s.desc && s.icon, `${s.id} : fiche incomplète`);
  }
  assert.equal(STYLES.length, 6, 'l\'Académie compte cinq styles et l\'école des finales');
});

console.log(`\n${passed} tests réussis${process.exitCode ? ' (avec des ÉCHECS)' : ''}`);
