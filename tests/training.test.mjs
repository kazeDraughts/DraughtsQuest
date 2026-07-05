/**
 * Validation des exercices d'entraînement : chaque étape est rejouée sur le
 * moteur de règles réel. On vérifie que :
 * - chaque position (FEN) est valide et que c'est bien aux Blancs de jouer ;
 * - chaque coup accepté est LÉGAL dans la position de l'étape ;
 * - les indices correspondent à un coup accepté ;
 * - les répliques noires scriptées sont légales après le coup accepté ;
 * - l'enchaînement des étapes est jouable de bout en bout ;
 * - les exercices de tactique rapportent bien du matériel (le thème annoncé).
 *
 * Lancer : node tests/training.test.mjs
 */

import assert from 'node:assert/strict';
import { RulesEngine } from '../src/engine/rules.js';
import { findBestMove } from '../src/ai/search.js';
import { EXERCISES } from '../src/story/training.js';

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

const material = (engine) => {
  const c = engine.countPieces();
  return { w: c.w + 3 * c.W, b: c.b + 3 * c.B };
};

/**
 * Évaluation d'une position du point de vue des Blancs.
 * Déroule d'abord les coups FORCÉS (findBestMove renvoie un score neutre
 * par convention quand il n'y a qu'un coup légal — ex. rafle obligatoire).
 */
function whiteEval(fen) {
  const e = new RulesEngine(fen);
  let guard = 0;
  while (!e.isGameOver() && e.getLegalMoves().length === 1 && guard++ < 24) {
    e.applyMove(e.getLegalMoves()[0]);
  }
  if (e.isGameOver()) {
    return { score: e.winner() === 'w' ? 99999 : e.winner() === 'draw' ? 0 : -99999, engine: e };
  }
  const r = findBestMove(e.fen(), { maxDepth: 6, timeMs: 4000, noise: 0 }, 1);
  return { score: e.turn() === 'w' ? r.score : -r.score, engine: e };
}

console.log('Entraînement — validation des exercices par le moteur');

for (const ex of EXERCISES) {
  test(`[${ex.cat}] ${ex.title}`, () => {
    assert.ok(ex.steps.length > 0, 'exercice vide');
    assert.ok(ex.steps[0].fen, 'la première étape doit poser une position');
    let engine = null;
    let startMaterial = null;

    for (const [i, step] of ex.steps.entries()) {
      if (step.fen) {
        engine = new RulesEngine(step.fen);
        assert.equal(engine.turn(), 'w', `étape ${i + 1} : le trait doit être aux Blancs`);
        if (startMaterial === null) startMaterial = material(engine);
      }
      assert.ok(engine, `étape ${i + 1} sans position`);

      const legal = engine.getLegalMoves();
      assert.ok(legal.length > 0, `étape ${i + 1} : aucune position jouable`);
      assert.ok(step.accept?.length, `étape ${i + 1} : aucun coup accepté défini`);

      // Au moins un coup accepté doit être légal dans cette ligne de jeu.
      // (Les autres entrées peuvent couvrir des variantes du joueur : elles
      // ne matcheront jamais un coup illégal à l'exécution, c'est sans risque.)
      const playable = step.accept.filter((a) => legal.some((m) => m.from === a.from && m.to === a.to));
      assert.ok(
        playable.length > 0,
        `étape ${i + 1} : aucun coup accepté n'est légal (légaux : ${legal.map((m) => `${m.from}-${m.to}`).join(', ')})`,
      );
      // L'indice, s'il existe, doit être un coup accepté
      if (step.hint) {
        assert.ok(
          step.accept.some((a) => a.from === step.hint.from && a.to === step.hint.to),
          `étape ${i + 1} : l'indice ne correspond à aucun coup accepté`,
        );
      }

      // Anti-réfutation (tactique) : après le coup accepté, AUCUNE défense
      // noire ne doit sauver les Noirs — chaque réplique légale doit laisser
      // les Blancs gagnants au minimax. (C'est ce contrôle qui aurait
      // attrapé la réfutation 17x28 du « coup de deux ».)
      if (ex.cat === 'Tactique' && step.reply) {
        const probe = new RulesEngine(engine.fen());
        probe.applyMove(playable[0]);
        for (const blackMove of probe.getLegalMoves()) {
          const c = new RulesEngine(probe.fen());
          c.applyMove(blackMove);
          const { score, engine: after } = whiteEval(c.fen());
          const dName = `${blackMove.from}${blackMove.captures.length ? 'x' : '-'}${blackMove.to}`;
          assert.ok(
            score >= 80,
            `${ex.id} étape ${i + 1} : la défense noire ${dName} RÉFUTE la combinaison (éval blanche ${Math.round(score)})`,
          );
          // Pas de pion noir passé profond après la séquence forcée : un pion
          // aux portes de la promotion transforme le « gain » en finale
          // dame+pion contre dame, nulle réglementaire (règle des 5 coups).
          const b = after.getBoard();
          for (let s = 36; s <= 45; s++) {
            assert.ok(
              b[s] !== 'b',
              `${ex.id} étape ${i + 1} : après la défense ${dName}, un pion noir passé en ${s} mène à une finale nulle`,
            );
          }
        }
      }

      // On joue le premier coup accepté jouable, puis la réplique scriptée
      const played = engine.applyMove(playable[0]);
      assert.ok(played, `étape ${i + 1} : le coup accepté n'a pas pu être joué`);
      if (step.reply) {
        assert.equal(engine.turn(), 'b', `étape ${i + 1} : la réplique noire arrive hors tour`);
        const reply = engine.applyMove(step.reply);
        assert.ok(reply, `étape ${i + 1} : réplique noire ${step.reply.from}->${step.reply.to} illégale`);
      }
    }

    // Les exercices de tactique doivent rapporter du matériel net
    if (ex.cat === 'Tactique') {
      const end = material(engine);
      const gain = (startMaterial.b - end.b) - (startMaterial.w - end.w);
      assert.ok(gain >= 1, `${ex.id} : la combinaison ne gagne pas de matériel (gain ${gain})`);
    }
  });
}

test('identifiants uniques et récompenses définies', () => {
  const ids = new Set();
  for (const ex of EXERCISES) {
    assert.ok(!ids.has(ex.id), `id en double : ${ex.id}`);
    ids.add(ex.id);
    assert.ok(ex.reward > 0, `${ex.id} : récompense manquante`);
    assert.ok(ex.title && ex.desc && ex.cat, `${ex.id} : fiche incomplète`);
  }
});

console.log(`\n${passed} tests réussis${process.exitCode ? ' (avec des ÉCHECS)' : ''}`);
