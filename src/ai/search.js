/**
 * IA de dames « maison » : minimax avec élagage alpha-bêta (forme négamax),
 * approfondissement itératif borné dans le temps, extension des rafles
 * (quiescence) et bruit réglable pour créer des niveaux de difficulté.
 *
 * Architecture inspirée de rapid-draughts (moteurs "random" / "alphaBeta" à
 * profondeur réglable), entièrement réécrite ici pour le 10x10 international.
 *
 * La recherche s'appuie sur RulesEngine (donc sur la bibliothèque de règles) :
 * l'IA ne réimplémente PAS les règles. Les positions sont restaurées par
 * instantané FEN — l'undo natif de la bibliothèque vendorisée a un bug connu
 * sur les promotions (drapeaux écrasés), on ne l'utilise donc pas.
 */

import { RulesEngine } from '../engine/rules.js';
import { evaluate, WIN_SCORE } from './evaluate.js';

/** Générateur pseudo-aléatoire déterministe (mulberry32) pour le bruit. */
export function makeRng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

class Timeout extends Error {}

/**
 * Cherche le meilleur coup dans une position.
 *
 * @param {string} fen position à analyser
 * @param {object} cfg { maxDepth, timeMs, noise, blunder }
 *   - maxDepth : profondeur maximale (approfondissement itératif) ;
 *   - timeMs   : budget temps (l'itération en cours est abandonnée) ;
 *   - noise    : amplitude (centipions) d'un bruit ajouté aux feuilles ;
 *   - blunder  : probabilité (0..1) de jouer un coup au hasard (niveaux faibles).
 * @param {number} seed graine du bruit (résultats reproductibles en test)
 * @returns {{move: {from, to}, depth, nodes, ms, score}}
 */
export function findBestMove(fen, cfg, seed = Date.now() & 0xffffffff) {
  const { maxDepth = 4, timeMs = 1500, noise = 0, blunder = 0 } = cfg;
  const rng = makeRng(seed);
  const engine = new RulesEngine(fen);
  const me = engine.turn(); // 'w' ou 'b'
  const sign = me === 'w' ? 1 : -1;
  const t0 = Date.now();
  const deadline = t0 + timeMs;
  let nodes = 0;

  const rootMoves = engine.getLegalMoves();
  if (rootMoves.length === 0) return { move: null, depth: 0, nodes, ms: 0, score: -WIN_SCORE };

  // Niveaux faibles : gaffe volontaire (coup uniformément aléatoire).
  if (rootMoves.length > 1 && rng() < blunder) {
    const move = rootMoves[Math.floor(rng() * rootMoves.length)];
    return { move, depth: 0, nodes: 1, ms: Date.now() - t0, score: 0, blunder: true };
  }
  if (rootMoves.length === 1) {
    return { move: rootMoves[0], depth: 0, nodes: 1, ms: Date.now() - t0, score: 0 };
  }

  /** Tri des coups : rafles longues puis promotions puis avancement. */
  const orderMoves = (moves) => moves
    .map((m) => ({ m, k: m.captures.length * 1000 + (m.promotion ? 100 : 0) + rng() }))
    .sort((a, b) => b.k - a.k)
    .map((x) => x.m);

  /**
   * Négamax alpha-bêta. `color` = 1 si le camp au trait est `me`.
   * `qdepth` limite l'extension des chaînes de prises à l'horizon.
   */
  function negamax(depth, alpha, beta, color, ply, qdepth) {
    if ((++nodes & 255) === 0 && Date.now() > deadline) throw new Timeout();

    const moves = engine.getLegalMoves();
    if (moves.length === 0) {
      // Le camp au trait ne peut plus jouer : il a perdu.
      return -(WIN_SCORE - ply * 100);
    }

    const capturing = moves[0].captures.length > 0;
    if (depth <= 0 && (!capturing || qdepth <= 0)) {
      // Feuille « calme » (ou budget d'extension épuisé) : évaluation + bruit.
      const raw = evaluate(engine.getBoard()) * sign * color;
      return raw + (noise ? (rng() * 2 - 1) * noise : 0);
    }

    let best = -Infinity;
    for (const m of orderMoves(moves)) {
      const snapshot = engine.fen();
      engine.applyMove(m);
      const v = -negamax(
        depth - 1,
        -beta,
        -alpha,
        -color,
        ply + 1,
        depth <= 0 ? qdepth - 1 : qdepth,
      );
      engine.loadFen(snapshot);
      if (v > best) best = v;
      if (best > alpha) alpha = best;
      if (alpha >= beta) break; // élagage alpha-bêta
    }
    return best;
  }

  // Approfondissement itératif : on garde le meilleur coup de la dernière
  // itération complète ; la suivante est abandonnée si le temps est écoulé.
  let bestMove = rootMoves[0];
  let bestScore = 0;
  let reached = 0;

  for (let depth = 1; depth <= maxDepth; depth++) {
    try {
      let iterBest = null;
      let iterScore = -Infinity;
      let alpha = -Infinity;
      for (const m of orderMoves(rootMoves)) {
        const snapshot = engine.fen();
        engine.applyMove(m);
        const v = -negamax(depth - 1, -Infinity, -alpha, -1, 1, 8);
        engine.loadFen(snapshot);
        if (v > iterScore) {
          iterScore = v;
          iterBest = m;
        }
        if (v > alpha) alpha = v;
      }
      bestMove = iterBest;
      bestScore = iterScore;
      reached = depth;
      if (Date.now() > deadline) break;
      // Victoire forcée trouvée : inutile de creuser davantage.
      if (bestScore > WIN_SCORE - 10000) break;
    } catch (e) {
      if (e instanceof Timeout) break;
      throw e;
    }
  }

  return { move: bestMove, depth: reached, nodes, ms: Date.now() - t0, score: bestScore };
}
