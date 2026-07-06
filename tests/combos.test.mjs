/**
 * Certification de la banque d'énigmes (src/story/combos.js) par le moteur.
 * Pour CHAQUE combinaison de chaque série, on vérifie que :
 * - la position est valide, trait aux Blancs, sans prise au premier coup ;
 * - la ligne se rejoue de bout en bout : coups blancs légaux, répliques
 *   noires légales ET FORCÉES (unique coup légal — sinon inscriptable) ;
 * - le premier coup est un vrai sacrifice (les Noirs doivent prendre) ;
 * - aucune défense ne réfute : à chaque coup noir de la ligne, c'était le
 *   SEUL coup légal, donc la « défense » est couverte par construction ;
 * - à l'issue : gain matériel net (T1/T2) ou promotion sûre (T3), pas de
 *   pion noir passé profond, et évaluation profonde gagnante ;
 * - l'adaptateur comboToExercise produit des étapes jouables.
 *
 * Lancer : node tests/combos.test.mjs
 */

import assert from 'node:assert/strict';
import { RulesEngine } from '../src/engine/rules.js';
import { findBestMove } from '../src/ai/search.js';
import { COMBO_BANK, COMBO_SERIES, comboToExercise } from '../src/story/combos.js';

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
 * Évaluation côté Blancs, après déroulé des coups forcés (voir training.test).
 * Profondeur 8 : la même que la certification du générateur — les finales
 * dame contre pions demandent quelques coups de plus pour être « vues ».
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
  const r = findBestMove(e.fen(), { maxDepth: 8, timeMs: 8000, noise: 0 }, 1);
  return { score: e.turn() === 'w' ? r.score : -r.score, engine: e };
}

console.log('Énigmes des PNJ — certification de la banque par le moteur');

for (const series of COMBO_SERIES) {
  const bank = COMBO_BANK[series.id];
  test(`${series.title} : banque non vide`, () => {
    assert.ok(Array.isArray(bank) && bank.length >= 4, `série ${series.id} trop courte (${bank?.length ?? 0})`);
  });

  for (const [idx, rec] of bank.entries()) {
    test(`${series.id} #${idx + 1} — ${rec.fen}`, () => {
      const engine = new RulesEngine(rec.fen);
      assert.equal(engine.turn(), 'w', 'le trait doit être aux Blancs');
      assert.ok(!engine.mustCapture(), 'le premier coup ne doit pas être une prise imposée');
      assert.ok(engine.getLegalMoves().length >= 3, 'position trop pauvre en choix');
      const startMat = material(engine);

      for (const [i, step] of rec.line.entries()) {
        // Coup blanc de la ligne : légal, joué
        const legal = engine.getLegalMoves();
        const wm = legal.find((m) => m.from === step.w.from && m.to === step.w.to);
        assert.ok(wm, `coup blanc ${step.w.from}-${step.w.to} illégal au pas ${i + 1}`);
        engine.applyMove(wm);
        if (i === 0 && series.kind !== 'etude') {
          assert.ok(engine.mustCapture(), 'le premier coup doit être un sacrifice (prise noire obligatoire)');
        }
        // Étude : le coup enseigné doit être le SEUL gagnant — chaque autre
        // coup légal doit laisser filer le gain (éval <= 60).
        if (i === 0 && series.kind === 'etude') {
          for (const other of legal) {
            if (other.from === wm.from && other.to === wm.to) continue;
            const c = new RulesEngine(rec.fen);
            c.applyMove(other);
            const { score: sc } = whiteEval(c.fen());
            assert.ok(sc <= 60,
              `l'étude a une 2e solution : ${other.from}-${other.to} gagne aussi (éval ${Math.round(sc)})`);
          }
        }
        // Réplique noire : FORCÉE (unique) — c'est ce qui rend l'énigme sûre
        if (step.b) {
          assert.equal(engine.turn(), 'b', `pas ${i + 1} : réplique noire hors tour`);
          const defs = engine.getLegalMoves();
          assert.equal(defs.length, 1, `pas ${i + 1} : la réplique noire n'est pas forcée (${defs.length} défenses)`);
          assert.ok(defs[0].from === step.b.from && defs[0].to === step.b.to,
            `pas ${i + 1} : la réplique scriptée ${step.b.from}x${step.b.to} n'est pas la défense forcée`);
          engine.applyMove(defs[0]);
        }
      }

      // Fin de ligne : soit partie gagnée, soit position nettement gagnante
      const { score, engine: after } = whiteEval(engine.fen());
      assert.ok(score >= (series.kind === 'etude' ? 200 : 80),
        `la combinaison ne gagne pas (éval finale ${Math.round(score)})`);
      // Pas de pion noir passé profond (source de nulles dame+pion vs dame).
      // (Hors études : en finale, l'éval profonde ci-dessus fait foi.)
      if (!after.isGameOver() && series.kind !== 'etude') {
        const b = after.getBoard();
        for (let s = 36; s <= 45; s++) {
          assert.ok(b[s] !== 'b', `pion noir passé en ${s} : finale nulle possible`);
        }
      }
      // Le thème annoncé : gain matériel (T1/T2) ou couronne (T3) —
      // les études gagnent par la manœuvre, pas forcément au matériel.
      if (series.id === 'seraphine') {
        const last = rec.line[rec.line.length - 1].w;
        assert.ok(last.to <= 5, 'la ligne doit se terminer par une promotion (case 1-5)');
      } else if (series.kind !== 'etude') {
        const endMat = material(engine);
        const gain = (startMat.b - endMat.b) - (startMat.w - endMat.w);
        assert.ok(gain >= 1, `pas de gain matériel net (gain ${gain})`);
      }

      // L'adaptateur doit produire un exercice jouable et complet
      const ex = comboToExercise(series.id, idx);
      assert.ok(ex && ex.steps.length === rec.line.length, 'adaptation en exercice incomplète');
      assert.ok(ex.steps[0].fen === rec.fen && ex.steps[0].intro?.length, 'première étape mal formée');
      for (const st of ex.steps) {
        assert.ok(st.accept?.length === 1 && st.wrong && st.hint, 'étape sans coup accepté/erreur/indice');
      }
    });
  }
}

test('pas de doublon de position dans la banque', () => {
  const fens = Object.values(COMBO_BANK).flat().map((r) => r.fen);
  assert.equal(new Set(fens).size, fens.length, 'FEN en double dans la banque');
});

console.log(`\n${passed} tests réussis${process.exitCode ? ' (avec des ÉCHECS)' : ''}`);
