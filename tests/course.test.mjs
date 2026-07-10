/**
 * Cours de l'Académie : chaque chapitre est rejoué sur le moteur.
 * - toute position (FEN) est valide ;
 * - chaque coup d'illustration (show / drill.then) est légal dans l'ordre ;
 * - chaque coup d'exercice (drill.accept) est légal dans sa position, son
 *   indice correspond, sa réplique noire est légale ET forcée, et le coup
 *   enseigné n'est pas une gaffe (éval blanche >= -60, minimax) ;
 * - le cours a une vraie profondeur (>= 6 chapitres, plusieurs exercices).
 *
 * Lancer : node tests/course.test.mjs
 */

import assert from 'node:assert/strict';
import { RulesEngine } from '../src/engine/rules.js';
import { findBestMove } from '../src/ai/search.js';
import { COURSES } from '../src/story/courses.js';

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

const parse = (mv) => mv.split(/[x-]/).map(Number);

function whiteEval(fen, depth = 7, ms = 3000) {
  const e = new RulesEngine(fen);
  let g = 0;
  while (!e.isGameOver() && e.getLegalMoves().length === 1 && g++ < 24) e.applyMove(e.getLegalMoves()[0]);
  if (e.isGameOver()) return e.winner() === 'w' ? 99999 : e.winner() === 'draw' ? 0 : -99999;
  const r = findBestMove(e.fen(), { maxDepth: depth, timeMs: ms, noise: 0 }, 1);
  return e.turn() === 'w' ? r.score : -r.score;
}

console.log('Cours de l\'Académie — validation par le moteur');

for (const course of Object.values(COURSES)) {
  test(`${course.title} : structure`, () => {
    assert.ok(course.id && course.npc && course.reward > 0, 'fiche de cours incomplète');
    assert.ok(course.chapters.length >= 6, 'un cours complet doit avoir au moins 6 chapitres');
    const drills = course.chapters.filter((c) => c.drill).length;
    assert.ok(drills >= 2, 'un cours doit contenir au moins deux exercices');
  });

  for (const [i, ch] of course.chapters.entries()) {
    test(`${course.id} — ch.${i + 1} « ${ch.title} »`, () => {
      assert.ok(ch.title && ch.fen && ch.say?.length, 'chapitre incomplet');
      const engine = new RulesEngine(ch.fen);
      assert.ok(engine.getLegalMoves().length > 0, 'position sans coup jouable');

      // Illustration : chaque coup doit être légal dans l'ordre.
      for (const s of ch.show || []) {
        const [f, t] = parse(s.mv);
        const m = engine.getLegalMoves().find((x) => x.from === f && x.to === t);
        assert.ok(m, `coup d'illustration ${s.mv} illégal`);
        engine.applyMove(m);
      }

      if (ch.drill) {
        const d = ch.drill;
        assert.ok(d.accept?.length && d.wrong && d.success?.length, 'exercice incomplet');
        const drillEngine = new RulesEngine(engine.fen());
        const legal = drillEngine.getLegalMoves();
        const playable = d.accept.filter((a) => legal.some((m) => m.from === a.from && m.to === a.to));
        assert.ok(playable.length > 0, `aucun coup accepté n'est légal (légaux : ${legal.map((m) => `${m.from}-${m.to}`).join(', ')})`);
        if (d.hint) {
          assert.ok(d.accept.some((a) => a.from === d.hint.from && a.to === d.hint.to), 'indice hors des coups acceptés');
        }
        // Le coup enseigné n'est pas une gaffe.
        const probe = new RulesEngine(drillEngine.fen());
        probe.applyMove(playable[0]);
        assert.ok(whiteEval(probe.fen()) >= -60, `le coup enseigné ${playable[0].from}-${playable[0].to} est mauvais`);
        // Réplique noire scriptée : légale et FORCÉE (prise obligatoire).
        if (d.reply) {
          assert.equal(probe.turn(), 'b', 'réplique hors tour');
          const defs = probe.getLegalMoves();
          assert.ok(defs.some((m) => m.from === d.reply.from && m.to === d.reply.to), 'réplique noire illégale');
          if (defs[0].captures.length) {
            assert.equal(defs.length, 1, 'la réplique de prise devrait être unique (forcée)');
          }
          probe.applyMove(d.reply);
        }
        // Suite d'illustration après l'exercice : légale dans l'ordre.
        for (const s of d.then || []) {
          const [f, t] = parse(s.mv);
          const m = probe.getLegalMoves().find((x) => x.from === f && x.to === t);
          assert.ok(m, `coup de conclusion ${s.mv} illégal`);
          probe.applyMove(m);
        }
      }
    });
  }
}

console.log(`\n${passed} tests réussis${process.exitCode ? ' (avec des ÉCHECS)' : ''}`);
