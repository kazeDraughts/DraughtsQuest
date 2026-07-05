/**
 * RulesEngine — façade propre et remplaçable autour du moteur de règles
 * des dames internationales 10x10 (bibliothèque vendorisée @jortvl/draughts).
 *
 * Tout le reste du jeu (interface, IA, tutoriel…) ne parle qu'à cette classe :
 * pour changer de moteur, il suffit de réimplémenter cette interface.
 *
 * Conventions :
 * - Cases numérotées 1..50 (notation internationale ; case 1 en haut à gauche,
 *   les Noirs partent en haut, les Blancs en bas).
 * - Pièces : 'w' pion blanc, 'W' dame blanche, 'b' pion noir, 'B' dame noire,
 *   null pour case vide.
 * - Un coup : { from, to, captures: [cases], promotion: bool }.
 */

import { Draughts } from '../../vendor/draughts.js';

export const WHITE = 'w';
export const BLACK = 'b';

/** Position de départ officielle (FEN dames internationales). */
export const START_FEN = 'W:W31-50:B1-20';

export class RulesEngine {
  constructor(fen = START_FEN) {
    this._d = Draughts(fen);
    // Compteurs pour les règles de nulle (la bibliothèque ne les gère pas) :
    // demi-coups « calmes » (règle des 25 coups de dames) et demi-coups en
    // configuration de finale réglementée (règles des 5 et 16 coups).
    this._quietHalfMoves = 0;
    this._endgameCfg = null;
    this._endgameHalfMoves = 0;
  }

  /** Camp au trait : 'w' ou 'b'. */
  turn() {
    return this._d.turn() === 'w' ? WHITE : BLACK;
  }

  /** Position complète au format FEN (sauvegarde, IA, tests). */
  fen() {
    return this._d.fen();
  }

  /** Recharge une position FEN. Retourne false si la FEN est invalide. */
  loadFen(fen) {
    const ok = this._d.load(fen);
    this._quietHalfMoves = 0;
    this._endgameCfg = null;
    this._endgameHalfMoves = 0;
    return ok !== false;
  }

  /**
   * Damier sous forme de tableau indexé 1..50 (l'indice 0 est inutilisé).
   * Chaque entrée vaut 'w', 'W', 'b', 'B' ou null.
   */
  getBoard() {
    const pos = this._d.position(); // ex : 'Wbbbb…' — le 1er caractère est le trait
    const board = [null];
    for (let i = 1; i <= 50; i++) {
      const c = pos.charAt(i);
      board.push(c === '0' ? null : c);
    }
    return board;
  }

  /**
   * Tous les coups légaux pour le camp au trait, prise obligatoire et RAFLE
   * MAJORITAIRE déjà appliquées : la bibliothèque génère toutes les rafles
   * possibles et ne retourne que celles de longueur maximale
   * (getCaptures() + longestCapture()) ; s'il existe au moins une prise,
   * aucun coup simple n'est retourné.
   */
  getLegalMoves() {
    const board = this.getBoard();
    return this._d.moves().map((m) => this._normalize(m, board));
  }

  /** Coups légaux jouables depuis une case donnée (sous-ensemble du global). */
  movesFrom(square) {
    return this.getLegalMoves().filter((m) => m.from === square);
  }

  /** Y a-t-il au moins une prise obligatoire pour le camp au trait ? */
  mustCapture() {
    const moves = this.getLegalMoves();
    return moves.length > 0 && moves[0].captures.length > 0;
  }

  /**
   * Joue un coup {from, to}. Retourne le coup normalisé appliqué
   * (avec ses prises), ou null si le coup est illégal.
   * NB : si plusieurs chemins de rafle partagent le même départ et la même
   * arrivée, ils capturent par définition le même nombre de pièces (rafle
   * majoritaire) ; le moteur en choisit un, conformément à la notation
   * officielle qui ne distingue pas ces chemins.
   */
  applyMove({ from, to }) {
    const before = this.getBoard();
    const played = this._d.move({ from: Number(from), to: Number(to) });
    if (!played) return null;
    const norm = this._normalize(played);
    // Règle de nulle « 25 coups » : 25 coups (50 demi-coups) consécutifs de
    // dames, sans prise et sans mouvement de pion => partie nulle.
    const movedAKing = before[norm.from] === 'W' || before[norm.from] === 'B';
    if (norm.captures.length === 0 && movedAKing) {
      this._quietHalfMoves++;
    } else {
      this._quietHalfMoves = 0;
    }
    // Règles de nulle des finales contre dame seule (règlement FFJD/FMJD) :
    // le compteur court tant que la CONFIGURATION de matériel ne change pas
    // (toute prise ou promotion la change et remet le compteur à zéro).
    const cfg = this._endgameConfig();
    if (cfg && cfg === this._endgameCfg) {
      this._endgameHalfMoves++;
    } else {
      this._endgameCfg = cfg;
      this._endgameHalfMoves = 0;
    }
    return norm;
  }

  /**
   * Configuration de finale réglementée, ou null.
   * - 'five'    : dame seule contre au plus 2 pièces dont au moins une dame
   *               => nulle après 5 coups (10 demi-coups) ;
   * - 'sixteen' : dame seule contre au plus 3 pièces dont au moins une dame
   *               (3 dames, 2 dames+pion, dame+2 pions)
   *               => nulle après 16 coups (32 demi-coups).
   */
  _endgameConfig() {
    const c = this.countPieces();
    const lone = (kings, men, oKings, oPieces) =>
      kings === 1 && men === 0 && oKings >= 1 && oPieces >= 1;
    for (const [k, m, oK, oM] of [[c.W, c.w, c.B, c.b], [c.B, c.b, c.W, c.w]]) {
      if (lone(k, m, oK, oK + oM)) {
        const oTotal = oK + oM;
        if (oTotal <= 2) return `five:${c.w},${c.W},${c.b},${c.B}`;
        if (oTotal <= 3) return `sixteen:${c.w},${c.W},${c.b},${c.B}`;
      }
    }
    return null;
  }

  _endgameDraw() {
    if (!this._endgameCfg) return false;
    if (this._endgameCfg.startsWith('five:')) return this._endgameHalfMoves >= 10;
    return this._endgameHalfMoves >= 32;
  }

  /** La partie est-elle terminée (victoire, ou nulle) ? */
  isGameOver() {
    return this._quietHalfMoves >= 50 || this._endgameDraw() || this._d.gameOver();
  }

  /**
   * Résultat : 'w' ou 'b' (vainqueur), 'draw' (nulle), ou null si la partie
   * continue. Le camp au trait qui n'a plus de coup (bloqué ou plus de
   * pièces) a perdu — règle officielle.
   */
  winner() {
    if (!this.isGameOver()) return null;
    if (this._quietHalfMoves >= 50 || this._endgameDraw() || this._d.inThreefoldRepetition()) return 'draw';
    return this.turn() === WHITE ? BLACK : WHITE;
  }

  /** Nombre de pièces restantes par camp : { w, b, W, B }. */
  countPieces() {
    const counts = { w: 0, W: 0, b: 0, B: 0 };
    const board = this.getBoard();
    for (let i = 1; i <= 50; i++) {
      if (board[i]) counts[board[i]]++;
    }
    return counts;
  }

  /** Copie indépendante de la position courante (pour l'IA, le tutoriel…). */
  clone() {
    return new RulesEngine(this.fen());
  }

  /**
   * Normalise un coup de la bibliothèque vers notre format
   * { from, to, captures[], jumps[], promotion }.
   */
  _normalize(m, board = null) {
    const from = Number(m.from);
    const to = Number(m.to);
    // Attention au vocabulaire de la bibliothèque : son champ `captures`
    // contient en fait les cases DE PASSAGE (jumps, départ inclus) ; les
    // pièces réellement prises sont dans `takes`. On normalise : notre
    // `captures` = cases des pièces capturées.
    const captures = (m.takes ?? []).map(Number);
    const jumps = (m.jumps ?? []).map(Number);
    const piece = m.piece ?? (board ? board[from] : null);
    // Promotion : un pion qui TERMINE son coup sur la dernière rangée.
    // (Un pion qui ne fait que traverser la dernière rangée pendant une
    // rafle n'est pas promu — la bibliothèque ne promeut que sur `to`.)
    const promotion = piece === 'w' ? to <= 5 : piece === 'b' ? to >= 46 : false;
    return { from, to, captures, jumps, promotion };
  }
}
