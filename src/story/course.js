/**
 * Moteur des COURS de l'Académie — un vrai cours à chapitres, plus profond
 * qu'une simple leçon : chaque chapitre explique une IDÉE directrice, montre
 * la manœuvre type jouée sur le damier, et propose parfois un exercice où le
 * joueur doit trouver lui-même le coup clé.
 *
 * Chapitre :
 *   { title, fen,
 *     say:   [répliques]          explications avant de montrer,
 *     show:  [{ mv:'34-29', note?}] coups d'illustration joués automatiquement,
 *     drill: { ask, accept:[{from,to}], reply?, wrong, success, hint } }
 *
 * Le CONTENU (idées, plans, cases clés) est original ; les positions et les
 * lignes proviennent des grands systèmes et sont revérifiées par le moteur
 * (tests/course.test.mjs).
 */

import { RulesEngine } from '../engine/rules.js';
import { waitForMove } from './training.js';

const parse = (mv) => mv.split(/[x-]/).map(Number);

/**
 * Déroule un cours sur le damier de l'écran de partie.
 * @returns {Promise<boolean>} true si terminé, false si interrompu
 */
export async function runCourse(course, { boardView, dialogue, setStatus, signal, guided = true }) {
  const N = course.chapters.length;
  const npc = course.npc;

  for (let i = 0; i < N; i++) {
    const ch = course.chapters[i];
    if (signal.aborted) return false;
    setStatus(`${course.title} — ${i + 1}/${N} · ${ch.title}`);

    const engine = new RulesEngine(ch.fen);
    boardView.setState(engine.getBoard(), { lastMove: null });
    if (ch.say) await dialogue.play(ch.say);
    if (signal.aborted) return false;

    // Illustration : coups joués automatiquement, avec notes éventuelles.
    for (const s of ch.show || []) {
      if (signal.aborted) return false;
      const [f, t] = parse(s.mv);
      const before = engine.getBoard();
      const m = engine.getLegalMoves().find((x) => x.from === f && x.to === t);
      if (!m) continue; // ne devrait pas arriver : lignes vérifiées par les tests
      engine.applyMove(m);
      await boardView.animateMove(m, before, engine.getBoard());
      if (s.note) {
        if (signal.aborted) return false;
        await dialogue.play([{ who: npc, text: s.note }]);
      }
    }

    // Exercice : le joueur doit trouver le coup clé.
    if (ch.drill) {
      const d = ch.drill;
      if (d.ask) await dialogue.play(d.ask);
      const drillFen = engine.fen();
      let solved = false;
      let fails = 0;
      while (!solved && !signal.aborted) {
        const move = await waitForMove(engine, boardView, signal, fails >= 2 ? d.hint : null, guided);
        if (signal.aborted) return false;
        const ok = d.accept.some((a) => a.from === move.from && a.to === move.to);
        if (ok) {
          solved = true;
          if (d.reply) {
            await new Promise((r) => setTimeout(r, 300));
            const before = engine.getBoard();
            const rm = engine.getLegalMoves().find((m) => m.from === d.reply.from && m.to === d.reply.to);
            if (rm) { engine.applyMove(rm); await boardView.animateMove(rm, before, engine.getBoard()); }
          }
        } else {
          fails++;
          if (d.wrong) await dialogue.play([d.wrong]);
          engine.loadFen(drillFen);
          boardView.setState(engine.getBoard(), { lastMove: null });
        }
      }
      if (signal.aborted) return false;
      // Coups d'illustration APRÈS l'exercice (la suite gagnante, p. ex.).
      for (const s of d.then || []) {
        const [f, t] = parse(s.mv);
        const before = engine.getBoard();
        const m = engine.getLegalMoves().find((x) => x.from === f && x.to === t);
        if (!m) continue;
        engine.applyMove(m);
        await boardView.animateMove(m, before, engine.getBoard());
      }
      if (d.success) await dialogue.play(d.success);
    }
  }
  return !signal.aborted;
}
