/**
 * AIPlayer — façade côté interface pour faire jouer l'IA.
 * Utilise un Web Worker (module) ; si les Workers sont indisponibles,
 * bascule en calcul direct sur le fil principal (profondeur bridée pour
 * ne pas geler l'interface).
 */

import { levelById } from './levels.js';

let worker = null;
let nextId = 1;
const pending = new Map();

function getWorker() {
  if (worker) return worker;
  try {
    worker = new Worker(new URL('./worker.js', import.meta.url), { type: 'module' });
    worker.onmessage = (ev) => {
      const { id, move, stats, error } = ev.data;
      const p = pending.get(id);
      if (!p) return;
      pending.delete(id);
      if (error) p.reject(new Error(error));
      else p.resolve({ move, stats });
    };
    worker.onerror = (e) => {
      console.warn('Worker IA indisponible, calcul sur le fil principal.', e.message || e);
      for (const p of pending.values()) p.reject(new Error('worker error'));
      pending.clear();
      worker.broken = true;
    };
  } catch {
    worker = { broken: true };
  }
  return worker;
}

/** Calcul de secours, sans worker (profondeur limitée pour rester réactif). */
async function computeInline(fen, cfg, seed) {
  const { findBestMove } = await import('./search.js');
  const capped = { ...cfg, maxDepth: Math.min(cfg.maxDepth, 5), timeMs: Math.min(cfg.timeMs, 900) };
  const r = findBestMove(fen, capped, seed);
  return { move: r.move ? { from: r.move.from, to: r.move.to } : null, stats: r };
}

export class AIPlayer {
  /**
   * @param {string|object} level id d'un niveau nommé (levels.js) ou
   *        configuration directe { maxDepth, timeMs, noise, blunder }.
   */
  constructor(level) {
    this.cfg = typeof level === 'string' ? levelById(level) : level;
  }

  /** Renvoie une promesse de coup {from, to} pour la position donnée. */
  async getMove(fen, seed = (Math.random() * 2 ** 31) | 0) {
    const w = getWorker();
    if (w.broken) return (await computeInline(fen, this.cfg, seed)).move;
    const id = nextId++;
    try {
      const { move } = await new Promise((resolve, reject) => {
        pending.set(id, { resolve, reject });
        w.postMessage({ id, fen, cfg: this.cfg, seed });
      });
      return move;
    } catch {
      return (await computeInline(fen, this.cfg, seed)).move;
    }
  }
}
