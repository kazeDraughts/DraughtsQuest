/**
 * Match — contrôleur d'une partie de dames : boucle des tours, entrées du
 * joueur humain, appels à l'IA, détection de fin, messages d'aide.
 *
 * Les joueurs sont décrits par :
 *   { type: 'human', name }
 *   { type: 'ai', name, getMove: async (fen) => ({from, to}) }
 *
 * Options :
 *   fen           : position de départ (défaut : position officielle)
 *   allowedMoves  : filtre (moves) => moves — utilisé par le tutoriel pour
 *                   restreindre les coups autorisés à l'exercice en cours
 *   onMessage     : affichage d'un message court ("Prise obligatoire !", …)
 *   onMove        : notifié après chaque coup joué (sons, compteurs…)
 *   onTurn        : notifié à chaque changement de trait
 *   onEnd         : ({winner: 'w'|'b'|'draw', resigned}) fin de partie
 */

import { RulesEngine } from '../engine/rules.js';

export class Match {
  constructor({ boardView, white, black, fen, allowedMoves, onMessage, onMove, onTurn, onEnd }) {
    this.view = boardView;
    this.players = { w: white, b: black };
    this.engine = new RulesEngine(fen || undefined);
    this.allowedMoves = allowedMoves || ((moves) => moves);
    this.onMessage = onMessage || (() => {});
    this.onMove = onMove || (() => {});
    this.onTurn = onTurn || (() => {});
    this.onEnd = onEnd || (() => {});
    this.selected = null;
    this.finished = false;
    this._destroyed = false;
    this.plies = 0; // demi-coups joués (utile à la proposition de nulle)

    this.view.onTap = (sq) => this._handleTap(sq);
  }

  start() {
    this.view.setState(this.engine.getBoard(), { lastMove: null });
    this._nextTurn();
  }

  destroy() {
    this._destroyed = true;
    this.view.onTap = null;
  }

  /** Abandon du camp donné (défaut : camp au trait). */
  resign(color = this.engine.turn()) {
    if (this.finished) return;
    this.finished = true;
    this.onEnd({ winner: color === 'w' ? 'b' : 'w', resigned: true });
  }

  /** Nulle convenue entre les joueurs (l'IA a vérifié avant d'accepter). */
  agreeDraw() {
    if (this.finished) return;
    this.finished = true;
    this.onEnd({ winner: 'draw', agreed: true });
  }

  /** Coups légaux du moment, après filtre éventuel du tutoriel. */
  legalMoves() {
    return this.allowedMoves(this.engine.getLegalMoves(), this.engine);
  }

  _nextTurn() {
    if (this._destroyed || this.finished) return;
    if (this.engine.isGameOver()) return this._finish();

    const color = this.engine.turn();
    const player = this.players[color];
    this.onTurn(color, player);

    const moves = this.legalMoves();
    if (moves.length === 0) return this._finish();

    if (player.type === 'ai') {
      this._playAI(player);
    } else {
      // Tour humain : on montre les pièces jouables et la prise obligatoire.
      this.selected = null;
      const moveable = [...new Set(moves.map((m) => m.from))];
      this.view.setState(this.engine.getBoard(), { moveable, lastMove: this.view.lastMove });
      if (moves[0].captures.length > 1) {
        this.onMessage(`Rafle obligatoire : ${moves[0].captures.length} prises !`);
      } else if (moves[0].captures.length === 1) {
        this.onMessage('Prise obligatoire !');
      }
    }
  }

  async _playAI(player) {
    // L'IA calcule dans un Web Worker : l'interface reste fluide.
    const t0 = performance.now();
    let move;
    try {
      move = await player.getMove(this.engine.fen());
    } catch (e) {
      console.error('IA en erreur, coup de secours :', e);
      move = null;
    }
    if (this._destroyed || this.finished) return;
    const legal = this.legalMoves();
    let chosen = move && legal.find((m) => m.from === move.from && m.to === move.to);
    if (!chosen) chosen = legal[0]; // secours : premier coup légal
    // Petite pause pour que l'IA « réfléchisse » visiblement au moins 350 ms.
    const wait = Math.max(0, 350 - (performance.now() - t0));
    await new Promise((r) => setTimeout(r, wait));
    if (this._destroyed || this.finished) return;
    await this._play(chosen);
  }

  async _play(move) {
    const before = this.engine.getBoard();
    const applied = this.engine.applyMove(move);
    if (!applied) return; // ne devrait jamais arriver : coup issu de legalMoves()
    const after = this.engine.getBoard();
    this.plies++;
    this.onMove(applied, this.engine);
    await this.view.animateMove({ ...applied, jumps: move.jumps ?? applied.jumps }, before, after);
    if (applied.promotion) this.onMessage('Promotion : une DAME !');
    this._nextTurn();
  }

  _finish() {
    if (this.finished) return;
    this.finished = true;
    const winner = this.engine.winner() ?? 'draw';
    this.onEnd({ winner, resigned: false });
  }

  _handleTap(sq) {
    if (this.finished || this._destroyed) return;
    const color = this.engine.turn();
    if (this.players[color].type !== 'human') return;
    const moves = this.legalMoves();

    if (this.selected) {
      const target = moves.find((m) => m.from === this.selected && m.to === sq);
      if (target) {
        this.selected = null;
        this._play(target);
        return;
      }
    }

    // Sélection (ou re-sélection) d'une pièce jouable.
    const own = sq && moves.some((m) => m.from === sq);
    if (own) {
      this.selected = sq;
      const targets = moves.filter((m) => m.from === sq).map((m) => ({ to: m.to, captures: m.captures }));
      this.view.setState(this.engine.getBoard(), {
        selected: sq,
        targets,
        moveable: [...new Set(moves.map((m) => m.from))],
        lastMove: this.view.lastMove,
      });
    } else {
      // Touche ailleurs : on désélectionne.
      this.selected = null;
      this.view.setState(this.engine.getBoard(), {
        moveable: [...new Set(moves.map((m) => m.from))],
        lastMove: this.view.lastMove,
      });
      if (sq && this.engine.getBoard()[sq] && moves.length && moves[0].captures.length > 0) {
        const mine = this.engine.getBoard()[sq].toLowerCase() === color;
        if (mine) this.onMessage('Cette pièce ne peut pas jouer : la prise est obligatoire !');
      }
    }
  }
}
