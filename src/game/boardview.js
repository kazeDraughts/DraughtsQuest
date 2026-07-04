/**
 * BoardView — rendu canvas du damier 10x10 et gestion des entrées
 * (souris ET tactile via les Pointer Events).
 *
 * Ce composant est purement visuel : il affiche un état (board + surbrillances)
 * et signale les cases touchées. Toute la logique de jeu vit dans Match.
 *
 * Numérotation : cases jouables 1..50 (notation internationale), Noirs en haut.
 */

import { boardThemeById, pieceThemeById } from '../shop/themes.js';
import { squareToCell, cellToSquare } from '../engine/coords.js';

export { squareToCell, cellToSquare };

export class BoardView {
  constructor(canvas, { boardTheme = 'classic', pieceTheme = 'classic' } = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.setThemes(boardTheme, pieceTheme);

    this.board = [];          // état affiché (tableau 1..50)
    this.selected = null;     // case sélectionnée
    this.targets = [];        // [{to, captures:[…]}] destinations légales
    this.moveable = [];       // cases des pièces qui peuvent jouer
    this.lastMove = null;     // {from, to} dernier coup joué
    this.hint = null;         // {from, to} suggestion (tutoriel)
    this.anim = null;         // animation en cours
    this.onTap = null;        // callback(square|null)

    this._raf = 0;
    this._resize = this._resize.bind(this);
    window.addEventListener('resize', this._resize);
    new ResizeObserver(this._resize).observe(canvas.parentElement);

    canvas.addEventListener('pointerdown', (ev) => {
      ev.preventDefault();
      if (!this.onTap || this.anim) return;
      const rect = canvas.getBoundingClientRect();
      const x = ev.clientX - rect.left - this.pad;
      const y = ev.clientY - rect.top - this.pad;
      const col = Math.floor(x / this.cell);
      const row = Math.floor(y / this.cell);
      this.onTap(cellToSquare(row, col));
    });

    this._resize();
  }

  destroy() {
    window.removeEventListener('resize', this._resize);
    cancelAnimationFrame(this._raf);
  }

  setThemes(boardTheme, pieceTheme) {
    this.theme = typeof boardTheme === 'string' ? boardThemeById(boardTheme) : boardTheme;
    this.pieces = typeof pieceTheme === 'string' ? pieceThemeById(pieceTheme) : pieceTheme;
    this.draw();
  }

  /** Met à jour l'état affiché et redessine. */
  setState(board, { selected = null, targets = [], moveable = [], lastMove = this.lastMove, hint = null } = {}) {
    this.board = board;
    this.selected = selected;
    this.targets = targets;
    this.moveable = moveable;
    this.lastMove = lastMove;
    this.hint = hint;
    this.draw();
  }

  /** Coordonnées (centre) d'une case en pixels CSS. */
  center(n) {
    const { row, col } = squareToCell(n);
    return {
      x: this.pad + col * this.cell + this.cell / 2,
      y: this.pad + row * this.cell + this.cell / 2,
    };
  }

  /**
   * Anime un coup (y compris une rafle : la pièce suit les cases de passage
   * et les pièces prises disparaissent au passage). Retourne une promesse.
   */
  animateMove(move, boardBefore, boardAfter) {
    return new Promise((resolve) => {
      const path = (move.jumps && move.jumps.length >= 2 ? move.jumps : [move.from, move.to])
        .map((s) => this.center(s));
      const hopMs = move.captures.length ? 260 : 180;
      this.anim = {
        move, boardBefore, boardAfter,
        path,
        taken: new Set(),
        start: performance.now(),
        hopMs,
        total: hopMs * (path.length - 1),
        resolve,
      };
      const step = () => {
        if (!this.anim) return;
        const t = performance.now() - this.anim.start;
        // Marque comme prises les pièces déjà dépassées.
        const hop = Math.min(Math.floor(t / hopMs), path.length - 2);
        for (let i = 0; i <= hop && i < move.captures.length; i++) {
          this.anim.taken.add(move.captures[i]);
        }
        this.draw();
        if (t >= this.anim.total) {
          const done = this.anim.resolve;
          this.anim = null;
          this.setState(boardAfter, { lastMove: { from: move.from, to: move.to } });
          done();
        } else {
          this._raf = requestAnimationFrame(step);
        }
      };
      this._raf = requestAnimationFrame(step);
    });
  }

  _resize() {
    const parent = this.canvas.parentElement;
    if (!parent) return;
    const size = Math.min(parent.clientWidth, parent.clientHeight);
    if (size <= 0) return;
    const dpr = window.devicePixelRatio || 1;
    this.size = size;
    this.pad = Math.max(10, size * 0.035);
    this.cell = (size - this.pad * 2) / 10;
    this.canvas.style.width = `${size}px`;
    this.canvas.style.height = `${size}px`;
    this.canvas.width = Math.round(size * dpr);
    this.canvas.height = Math.round(size * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.draw();
  }

  draw() {
    const { ctx, theme, cell, pad, size } = this;
    if (!size) return;
    ctx.clearRect(0, 0, size, size);

    // Cadre
    ctx.fillStyle = theme.border;
    this._roundRect(0, 0, size, size, Math.min(14, size * 0.02));
    ctx.fill();

    // Cases
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 10; col++) {
        const dark = (row + col) % 2 === 1;
        ctx.fillStyle = dark ? theme.dark : theme.light;
        const x = pad + col * cell;
        const y = pad + row * cell;
        ctx.fillRect(x, y, cell, cell);
        if (dark && theme.gridGlow) {
          ctx.strokeStyle = theme.glow;
          ctx.globalAlpha = 0.35;
          ctx.strokeRect(x + 1, y + 1, cell - 2, cell - 2);
          ctx.globalAlpha = 1;
        }
        if (theme.stars && !dark) this._stars(x, y, row * 10 + col);
      }
    }

    // Numéros des cases (discrets, utiles pour apprendre la notation)
    if (cell >= 30) {
      ctx.fillStyle = theme.coord;
      ctx.font = `${Math.max(8, cell * 0.2)}px system-ui, sans-serif`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      for (let n = 1; n <= 50; n++) {
        const { row, col } = squareToCell(n);
        ctx.fillText(String(n), pad + col * cell + 2, pad + row * cell + 2);
      }
    }

    // Surbrillances
    const paint = (n, color, alpha = 0.45) => {
      const { row, col } = squareToCell(n);
      ctx.fillStyle = color;
      ctx.globalAlpha = alpha;
      ctx.fillRect(pad + col * cell, pad + row * cell, cell, cell);
      ctx.globalAlpha = 1;
    };
    if (this.lastMove && !this.anim) {
      paint(this.lastMove.from, '#f6d743', 0.25);
      paint(this.lastMove.to, '#f6d743', 0.35);
    }
    for (const m of this.moveable) paint(m, '#7fd4ff', 0.25);
    if (this.selected) paint(this.selected, '#7fd4ff', 0.5);
    if (this.hint) {
      paint(this.hint.from, '#7dff9b', 0.4);
      paint(this.hint.to, '#7dff9b', 0.55);
    }

    // Pièces
    const animMove = this.anim?.move;
    const source = this.anim ? this.anim.boardBefore : this.board;
    for (let n = 1; n <= 50; n++) {
      const p = source[n];
      if (!p) continue;
      if (this.anim && (n === animMove.from || this.anim.taken.has(n))) continue;
      const { x, y } = this.center(n);
      this._drawPiece(x, y, p);
    }

    // Cibles légales (par-dessus les cases vides)
    if (!this.anim) {
      for (const t of this.targets) {
        const { x, y } = this.center(t.to);
        ctx.beginPath();
        ctx.arc(x, y, cell * 0.16, 0, Math.PI * 2);
        ctx.fillStyle = t.captures.length ? 'rgba(255,90,90,.85)' : 'rgba(125,255,155,.8)';
        ctx.fill();
        if (t.captures.length) {
          ctx.font = `bold ${cell * 0.26}px system-ui, sans-serif`;
          ctx.fillStyle = '#fff';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`×${t.captures.length}`, x, y - cell * 0.32);
        }
      }
    }

    // Pièce en mouvement (animation)
    if (this.anim) {
      const { path, hopMs, start } = this.anim;
      const t = performance.now() - start;
      const seg = Math.min(Math.floor(t / hopMs), path.length - 2);
      const f = Math.min(1, (t - seg * hopMs) / hopMs);
      const ease = f < 0.5 ? 2 * f * f : 1 - (-2 * f + 2) ** 2 / 2;
      const a = path[seg];
      const b = path[seg + 1];
      const piece = this.anim.boardBefore[animMove.from];
      this._drawPiece(a.x + (b.x - a.x) * ease, a.y + (b.y - a.y) * ease, piece, true);
    }
  }

  _roundRect(x, y, w, h, r) {
    const { ctx } = this;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  _stars(x, y, seed) {
    // Petites étoiles déterministes pour le thème spatial.
    const { ctx, cell } = this;
    let s = seed * 2654435761 % 2 ** 32;
    const rnd = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32);
    ctx.fillStyle = 'rgba(255,255,255,.7)';
    for (let i = 0; i < 3; i++) {
      const sx = x + rnd() * cell;
      const sy = y + rnd() * cell;
      const r = rnd() * 1.3 + 0.3;
      ctx.beginPath();
      ctx.arc(sx, sy, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  _drawPiece(x, y, code, lifted = false) {
    drawPiece(this.ctx, x, y, this.cell, code, this.pieces, this.theme.dark, lifted);
  }
}

/**
 * Dessine une pièce (pion ou dame) — utilisé par le damier ET par les
 * aperçus de la boutique.
 * @param {string} code 'w'|'W'|'b'|'B'
 * @param {object} pieces thème de pièces (voir themes.js)
 * @param {string} holeColor couleur du trou des donuts (case du damier)
 */
export function drawPiece(ctx, x, y, cell, code, pieces, holeColor = '#333', lifted = false) {
  const color = code.toLowerCase() === 'w' ? 'w' : 'b';
  const king = code === 'W' || code === 'B';
  const style = pieces[color];
  const r = cell * 0.38 * (lifted ? 1.08 : 1);

  ctx.save();
    // Ombre portée
    ctx.beginPath();
    ctx.ellipse(x, y + r * 0.18, r * 0.95, r * 0.6, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,.3)';
    ctx.fill();

    if (style.glow) {
      ctx.shadowColor = style.glow;
      ctx.shadowBlur = cell * 0.3;
    }

    switch (pieces.shape) {
      case 'ring': {
        ctx.lineWidth = r * 0.42;
        ctx.strokeStyle = style.fill;
        ctx.beginPath();
        ctx.arc(x, y, r * 0.72, 0, Math.PI * 2);
        ctx.stroke();
        break;
      }
      case 'gem': {
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const a = (Math.PI / 3) * i - Math.PI / 6;
          const px = x + Math.cos(a) * r;
          const py = y + Math.sin(a) * r;
          i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
        }
        ctx.closePath();
        ctx.fillStyle = style.fill;
        ctx.fill();
        ctx.strokeStyle = style.edge;
        ctx.lineWidth = 2;
        ctx.stroke();
        // facettes
        ctx.strokeStyle = style.line;
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.moveTo(x - r * 0.5, y - r * 0.3);
        ctx.lineTo(x, y);
        ctx.lineTo(x + r * 0.5, y - r * 0.3);
        ctx.stroke();
        ctx.globalAlpha = 1;
        break;
      }
      case 'ghost': {
        ctx.beginPath();
        ctx.arc(x, y - r * 0.15, r * 0.8, Math.PI, 0);
        const base = y + r * 0.7;
        ctx.lineTo(x + r * 0.8, base);
        for (let i = 0; i < 3; i++) {
          const wx = x + r * 0.8 - ((i * 2 + 1) * r * 0.8) / 3;
          ctx.quadraticCurveTo(wx + r * 0.13, base - r * 0.3, wx - r * 0.14, base);
        }
        ctx.closePath();
        ctx.fillStyle = style.fill;
        ctx.fill();
        ctx.strokeStyle = style.edge;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        // yeux
        ctx.fillStyle = style.line;
        ctx.beginPath();
        ctx.arc(x - r * 0.28, y - r * 0.2, r * 0.12, 0, Math.PI * 2);
        ctx.arc(x + r * 0.28, y - r * 0.2, r * 0.12, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'donut': {
        ctx.beginPath();
        ctx.arc(x, y, r * 0.9, 0, Math.PI * 2);
        ctx.fillStyle = style.fill;
        ctx.fill();
        ctx.strokeStyle = style.edge;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x, y, r * 0.85, 0, Math.PI * 2);
        ctx.strokeStyle = style.icing;
        ctx.lineWidth = r * 0.35;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x, y, r * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = holeColor;
        ctx.fill();
        break;
      }
      case 'ball': {
        const g = ctx.createRadialGradient(x - r * 0.4, y - r * 0.5, r * 0.1, x, y, r);
        g.addColorStop(0, '#ffffff');
        g.addColorStop(0.25, style.fill);
        g.addColorStop(1, style.edge);
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
        break;
      }
      default: { // 'disc' : pion de jeu de dames classique
        const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.4, r * 0.2, x, y, r * 1.1);
        g.addColorStop(0, style.fill);
        g.addColorStop(1, style.edge);
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
        ctx.strokeStyle = style.edge;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        // anneaux concentriques gravés
        ctx.strokeStyle = style.line;
        ctx.globalAlpha = 0.6;
        for (const k of [0.72, 0.5]) {
          ctx.beginPath();
          ctx.arc(x, y, r * k, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
      }
    }
    ctx.shadowBlur = 0;

    // Couronne des dames
    if (king) {
      const cr = r * 0.52;
      ctx.fillStyle = color === 'w' ? '#d4a017' : '#f6d743';
      ctx.strokeStyle = 'rgba(0,0,0,.45)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x - cr, y + cr * 0.5);
      ctx.lineTo(x - cr, y - cr * 0.2);
      ctx.lineTo(x - cr * 0.5, y + cr * 0.1);
      ctx.lineTo(x, y - cr * 0.55);
      ctx.lineTo(x + cr * 0.5, y + cr * 0.1);
      ctx.lineTo(x + cr, y - cr * 0.2);
      ctx.lineTo(x + cr, y + cr * 0.5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
}
