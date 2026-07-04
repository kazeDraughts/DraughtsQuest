/**
 * Web Worker de l'IA : le calcul minimax tourne ici, hors du fil principal,
 * pour que l'interface (animations, tactile) reste parfaitement fluide.
 *
 * Protocole : { id, fen, cfg, seed }  ->  { id, move, stats }
 */

import { findBestMove } from './search.js';

self.onmessage = (ev) => {
  const { id, fen, cfg, seed } = ev.data;
  try {
    const result = findBestMove(fen, cfg, seed);
    self.postMessage({
      id,
      move: result.move ? { from: result.move.from, to: result.move.to } : null,
      stats: { depth: result.depth, nodes: result.nodes, ms: result.ms, score: result.score },
    });
  } catch (e) {
    self.postMessage({ id, error: String(e) });
  }
};
