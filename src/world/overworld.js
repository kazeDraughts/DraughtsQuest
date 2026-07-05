/**
 * Overworld — moteur du monde en vue de dessus (style Animal Crossing) :
 * rendu canvas des cartes, déplacement du héros (clavier + joystick tactile),
 * collisions, PNJ qui flânent, portes/sorties et cibles d'interaction.
 *
 * La logique de JEU (dialogues, scénario, lancement des parties) vit dans
 * src/world/controller.js ; ce fichier ne fait que simuler et dessiner.
 */

import { MAPS, SOLID_TILES } from './maps.js';
import { characterById } from './npcs.js';
import { drawCharacter } from './portraits.js';

const DIRS = {
  up: { x: 0, y: -1 }, down: { x: 0, y: 1 },
  left: { x: -1, y: 0 }, right: { x: 1, y: 0 },
};

const TILE_COLORS = {
  '.': '#69b358', ',': '#5aa34c', f: '#69b358', p: '#d9b98a', s: '#e2cf9d',
  t: '#69b358', w: '#4a90c2', r: '#69b358',
  W: '#6b5844', F: '#c8a878', c: '#b0533f', x: '#0c0f14',
};

export class Overworld {
  constructor(canvas, hooks = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.hooks = hooks; // { onDoor, onNpc, onAction, onSign, isDoorLocked, onLockedDoor, playerLook }

    this.map = null;
    this.npcs = [];
    this.player = { x: 5, y: 5, dir: 'down', walking: false, step: 0 };
    this.keys = new Set();
    this.joy = { x: 0, y: 0 };
    this.paused = false;
    this.focus = null;         // cible d'interaction courante
    this._triggerLock = 0;     // anti re-déclenchement après téléportation
    this._running = false;
    this._last = 0;

    this._onKeyDown = (e) => {
      if (e.repeat) return;
      const k = e.key.toLowerCase();
      this.keys.add(k);
      if ((k === 'e' || k === ' ' || k === 'enter') && !this.paused) {
        e.preventDefault();
        this.triggerAction();
      }
    };
    this._onKeyUp = (e) => this.keys.delete(e.key.toLowerCase());
    this._resize = () => this._fit();
  }

  // ------------------------------------------------------------ cycle de vie
  start() {
    if (this._running) return;
    this._running = true;
    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);
    window.addEventListener('resize', this._resize);
    this._fit();
    this._last = performance.now();
    const loop = (t) => {
      if (!this._running) return;
      const dt = Math.min(0.05, (t - this._last) / 1000);
      this._last = t;
      this.update(dt);
      this.draw();
      this._raf = requestAnimationFrame(loop);
    };
    this._raf = requestAnimationFrame(loop);
  }

  stop() {
    this._running = false;
    cancelAnimationFrame(this._raf);
    window.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('keyup', this._onKeyUp);
    window.removeEventListener('resize', this._resize);
    this.keys.clear();
  }

  loadMap(id, at = null) {
    const map = MAPS[id];
    if (!map) throw new Error(`Carte inconnue : ${id}`);
    this.map = map;
    this.grid = map.grid;
    this.W = map.grid[0].length;
    this.H = map.grid.length;
    this.player.x = at?.x ?? map.spawn.x;
    this.player.y = at?.y ?? map.spawn.y;
    this.player.dir = at?.dir ?? 'down';
    this._triggerLock = 0.6; // demi-seconde sans déclencher de porte
    // Instancie les PNJ de la carte (position vivante, séparée des données)
    this.npcs = map.npcs.map((n) => ({
      ...n,
      hx: n.x, hy: n.y,        // point d'attache pour la flânerie
      look: characterById(n.id).look,
      name: characterById(n.id).name,
      step: 0, walking: false, wait: Math.random() * 2 + 1, tx: null, ty: null,
    }));
    this.focus = null;
  }

  npcById(id) {
    return this.npcs.find((n) => n.id === id);
  }

  /** Oriente un PNJ vers le joueur (utilisé au début d'un dialogue). */
  faceNpcToPlayer(id) {
    const n = this.npcById(id);
    if (!n) return;
    const dx = this.player.x - n.x;
    const dy = this.player.y - n.y;
    n.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
  }

  // ------------------------------------------------------------- interaction
  /** Déclenche l'interaction avec la cible en face du héros (bouton A / E). */
  triggerAction() {
    if (!this.focus || this.paused) return;
    const f = this.focus;
    if (f.kind === 'npc') this.hooks.onNpc?.(f.npc.id);
    else if (f.kind === 'action') this.hooks.onAction?.(f.ref.action, f.ref);
    else if (f.kind === 'sign') this.hooks.onSign?.(f.ref.text);
  }

  // ---------------------------------------------------------------- solidité
  _tileAt(x, y) {
    const gx = Math.floor(x);
    const gy = Math.floor(y);
    if (gx < 0 || gy < 0 || gx >= this.W || gy >= this.H) return 't';
    return this.grid[gy][gx];
  }

  _isDoorTile(gx, gy) {
    return this.map.doors.some((d) => d.x === gx && d.y === gy);
  }

  _solid(x, y) {
    const gx = Math.floor(x);
    const gy = Math.floor(y);
    if (this._isDoorTile(gx, gy)) return false;
    if (SOLID_TILES.has(this._tileAt(x, y))) return true;
    // Props solides (le paillasson et les panneaux ne bloquent pas)
    for (const p of this.map.props) {
      if (p.type === 'mat') continue;
      const solid = gx >= p.x && gx < p.x + (p.w || 1) && gy >= p.y && gy < p.y + (p.h || 1);
      if (solid) return true;
    }
    return false;
  }

  _blockedByNpc(x, y) {
    return this.npcs.some((n) => Math.hypot(n.x - x, n.y - y) < 0.55);
  }

  _canStand(x, y) {
    const r = 0.28; // demi-largeur du héros
    return !this._solid(x - r, y - r) && !this._solid(x + r, y - r)
      && !this._solid(x - r, y + r * 0.6) && !this._solid(x + r, y + r * 0.6)
      && !this._blockedByNpc(x, y);
  }

  // ------------------------------------------------------------------ update
  update(dt) {
    if (this._triggerLock > 0) this._triggerLock -= dt;
    if (!this.paused) {
      this._updatePlayer(dt);
      this._checkTriggers();
      this._updateFocus();
    }
    this._updateNpcs(dt);
  }

  _inputVector() {
    let x = 0;
    let y = 0;
    const k = this.keys;
    // Flèches + WASD + ZQSD (clavier français)
    if (k.has('arrowup') || k.has('w') || k.has('z')) y -= 1;
    if (k.has('arrowdown') || k.has('s')) y += 1;
    if (k.has('arrowleft') || k.has('a') || k.has('q')) x -= 1;
    if (k.has('arrowright') || k.has('d')) x += 1;
    x += this.joy.x;
    y += this.joy.y;
    const len = Math.hypot(x, y);
    return len > 1 ? { x: x / len, y: y / len } : { x, y };
  }

  _updatePlayer(dt) {
    const v = this._inputVector();
    const speed = 4.6; // tuiles/seconde
    const p = this.player;
    p.walking = Math.hypot(v.x, v.y) > 0.05;
    if (!p.walking) return;

    p.dir = Math.abs(v.x) > Math.abs(v.y) ? (v.x > 0 ? 'right' : 'left') : (v.y > 0 ? 'down' : 'up');
    p.step = (p.step + dt * 3) % 1;

    // Déplacement axe par axe : on glisse le long des murs.
    const nx = p.x + v.x * speed * dt;
    if (this._canStand(nx, p.y)) p.x = nx;
    const ny = p.y + v.y * speed * dt;
    if (this._canStand(p.x, ny)) p.y = ny;
  }

  _checkTriggers() {
    if (this._triggerLock > 0) return;
    const gx = Math.floor(this.player.x);
    const gy = Math.floor(this.player.y);
    const door = this.map.doors.find((d) => d.x === gx && d.y === gy);
    if (door) {
      if (door.lockFlag && this.hooks.isDoorLocked?.(door)) {
        // Porte verrouillée : petit recul + message
        this.player.y += 0.85;
        this._triggerLock = 0.4;
        this.hooks.onLockedDoor?.(door);
      } else {
        this._triggerLock = 1;
        this.hooks.onDoor?.(door.target);
      }
      return;
    }
    for (const e of this.map.exits) {
      if (this.player.x >= e.x1 && this.player.x <= e.x2
        && this.player.y >= e.y1 && this.player.y <= e.y2) {
        this._triggerLock = 1;
        this.hooks.onDoor?.(e.target);
        return;
      }
    }
  }

  _updateFocus() {
    const p = this.player;
    const d = DIRS[p.dir];
    const px = p.x + d.x * 0.95;
    const py = p.y + d.y * 0.95;

    // PNJ devant nous ?
    let best = null;
    let bestDist = 0.85;
    for (const n of this.npcs) {
      const dist = Math.hypot(n.x - px, n.y - (py - 0.2));
      if (dist < bestDist) { best = n; bestDist = dist; }
    }
    if (best) {
      this.focus = { kind: 'npc', npc: best };
      return;
    }
    // Objet interactif ou panneau ?
    const inRect = (r, x, y) => x >= r.x - 0.2 && x <= r.x + (r.w || 1) + 0.2
      && y >= r.y - 0.2 && y <= r.y + (r.h || 1) + 0.2;
    for (const it of this.map.interactables) {
      if (inRect(it, px, py)) {
        this.focus = { kind: 'action', ref: it };
        return;
      }
    }
    for (const pr of this.map.props) {
      if (pr.type === 'sign' && inRect(pr, px, py)) {
        this.focus = { kind: 'sign', ref: pr };
        return;
      }
    }
    this.focus = null;
  }

  _updateNpcs(dt) {
    for (const n of this.npcs) {
      n.step = (n.step + dt * 2.4) % 1;
      // Face au joueur s'il est tout près (et pendant les dialogues)
      const distP = Math.hypot(this.player.x - n.x, this.player.y - n.y);
      if (distP < 1.4) {
        n.walking = false;
        if (this.paused) continue;
        continue;
      }
      if (!n.wander || this.paused) { n.walking = false; continue; }
      if (n.tx == null) {
        n.wait -= dt;
        n.walking = false;
        if (n.wait <= 0) {
          const a = Math.random() * Math.PI * 2;
          const r = Math.random() * n.wander;
          n.tx = n.hx + Math.cos(a) * r;
          n.ty = n.hy + Math.sin(a) * r;
        }
      } else {
        const dx = n.tx - n.x;
        const dy = n.ty - n.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 0.08) {
          n.tx = null;
          n.wait = 1.5 + Math.random() * 2.5;
          n.walking = false;
        } else {
          const sp = 1.3 * dt;
          const nx = n.x + (dx / dist) * sp;
          const ny = n.y + (dy / dist) * sp;
          n.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
          n.walking = true;
          if (!this._solid(nx, ny) && Math.hypot(this.player.x - nx, this.player.y - ny) > 0.7) {
            n.x = nx;
            n.y = ny;
          } else {
            n.tx = null;
            n.wait = 1;
          }
        }
      }
    }
  }

  // -------------------------------------------------------------------- draw
  _fit() {
    const dpr = window.devicePixelRatio || 1;
    const w = this.canvas.clientWidth || this.canvas.parentElement.clientWidth;
    const h = this.canvas.clientHeight || this.canvas.parentElement.clientHeight;
    this.canvas.width = Math.round(w * dpr);
    this.canvas.height = Math.round(h * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.vw = w;
    this.vh = h;
    this.tile = Math.max(40, Math.min(64, Math.floor(Math.min(w, h) / 9)));
  }

  _camera() {
    const t = this.tile;
    let cx = this.player.x * t - this.vw / 2;
    let cy = this.player.y * t - this.vh / 2;
    cx = Math.max(0, Math.min(this.W * t - this.vw, cx));
    cy = Math.max(0, Math.min(this.H * t - this.vh, cy));
    if (this.W * t < this.vw) cx = (this.W * t - this.vw) / 2;
    if (this.H * t < this.vh) cy = (this.H * t - this.vh) / 2;
    return { cx, cy };
  }

  draw() {
    if (!this.map || !this.vw) return;
    const { ctx, tile: t } = this;
    const { cx, cy } = this._camera();
    ctx.fillStyle = this.map.outdoor ? '#3f7a38' : '#0c0f14';
    ctx.fillRect(0, 0, this.vw, this.vh);

    const x0 = Math.max(0, Math.floor(cx / t));
    const y0 = Math.max(0, Math.floor(cy / t));
    const x1 = Math.min(this.W - 1, Math.ceil((cx + this.vw) / t));
    const y1 = Math.min(this.H - 1, Math.ceil((cy + this.vh) / t));

    // --- sol ---
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const c = this.grid[y][x];
        const px = x * t - cx;
        const py = y * t - cy;
        ctx.fillStyle = TILE_COLORS[c] || '#69b358';
        ctx.fillRect(px, py, t + 1, t + 1);
        // variations déterministes pour casser la monotonie
        const h = ((x * 73856093) ^ (y * 19349663)) >>> 0;
        if ((c === '.' || c === ',') && h % 5 === 0) {
          ctx.fillStyle = 'rgba(0,0,0,.05)';
          ctx.fillRect(px + (h % t) * 0.6, py + (h % 7) * (t / 8), t * 0.12, t * 0.08);
        }
        if (c === 'f') {
          ctx.fillStyle = ['#e8608a', '#f0d048', '#f0f0f0'][h % 3];
          ctx.beginPath();
          ctx.arc(px + t * 0.3, py + t * 0.35, t * 0.08, 0, Math.PI * 2);
          ctx.arc(px + t * 0.65, py + t * 0.6, t * 0.07, 0, Math.PI * 2);
          ctx.fill();
        }
        if (c === 'p' || c === 's') {
          ctx.fillStyle = 'rgba(0,0,0,.06)';
          if (h % 4 === 0) ctx.fillRect(px + t * 0.2, py + t * 0.4, t * 0.15, t * 0.1);
        }
        if (c === 'w') {
          ctx.fillStyle = 'rgba(255,255,255,.25)';
          const ph = (performance.now() / 700 + (x + y) * 0.7) % (Math.PI * 2);
          ctx.fillRect(px + t * 0.15, py + t * (0.3 + Math.sin(ph) * 0.1), t * 0.3, t * 0.06);
        }
        if (c === 'c') {
          ctx.strokeStyle = 'rgba(0,0,0,.12)';
          ctx.strokeRect(px + 2, py + 2, t - 4, t - 4);
        }
        if (c === 'W') {
          ctx.fillStyle = 'rgba(255,255,255,.08)';
          ctx.fillRect(px, py, t, t * 0.25);
          ctx.strokeStyle = 'rgba(0,0,0,.25)';
          ctx.strokeRect(px, py, t, t);
        }
      }
    }

    // --- entités triées par profondeur (y) ---
    const drawables = [];
    for (const p of this.map.props) drawables.push({ y: p.y + (p.h || 1), kind: 'prop', p });
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        if (this.grid[y][x] === 't') drawables.push({ y: y + 1, kind: 'tree', x, ty: y });
        if (this.grid[y][x] === 'r') drawables.push({ y: y + 1, kind: 'rock', x, ty: y });
      }
    }
    for (const n of this.npcs) drawables.push({ y: n.y, kind: 'npc', n });
    drawables.push({ y: this.player.y, kind: 'player' });
    drawables.sort((a, b) => a.y - b.y);

    for (const d of drawables) {
      if (d.kind === 'tree') this._drawTree(d.x * t - cx, d.ty * t - cy);
      else if (d.kind === 'rock') this._drawRock(d.x * t - cx, d.ty * t - cy);
      else if (d.kind === 'prop') this._drawProp(d.p, cx, cy);
      else if (d.kind === 'npc') {
        drawCharacter(ctx, d.n.look, d.n.x * t - cx, d.n.y * t - cy, t, d.n.dir, d.n.walking ? d.n.step : 0);
      } else {
        const look = this.hooks.playerLook?.() || characterById('player').look;
        const p = this.player;
        drawCharacter(ctx, look, p.x * t - cx, p.y * t - cy, t, p.dir, p.walking ? p.step : 0);
      }
    }

    // --- bulle "!" au-dessus de la cible d'interaction ---
    if (this.focus && !this.paused) {
      let fx;
      let fy;
      if (this.focus.kind === 'npc') {
        fx = this.focus.npc.x;
        fy = this.focus.npc.y - 1.15;
      } else {
        const r = this.focus.ref;
        fx = r.x + (r.w || 1) / 2;
        fy = r.y - 0.35;
      }
      const bx = fx * t - cx;
      const by = fy * t - cy + Math.sin(performance.now() / 250) * 3;
      ctx.fillStyle = '#f6d743';
      ctx.strokeStyle = 'rgba(0,0,0,.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(bx, by, t * 0.19, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#4a3403';
      ctx.font = `bold ${t * 0.26}px system-ui`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('!', bx, by + 1);
    }

    // --- nom du lieu ---
    ctx.fillStyle = 'rgba(12,16,22,.55)';
    ctx.font = `600 13px system-ui`;
    const label = this.map.name;
    const tw = ctx.measureText(label).width;
    ctx.fillRect(this.vw / 2 - tw / 2 - 10, 8, tw + 20, 24);
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, this.vw / 2, 20);
  }

  _drawTree(px, py) {
    const { ctx, tile: t } = this;
    ctx.fillStyle = '#7a5230';
    ctx.fillRect(px + t * 0.42, py + t * 0.45, t * 0.16, t * 0.45);
    ctx.fillStyle = '#3e7d33';
    ctx.beginPath();
    ctx.arc(px + t * 0.5, py + t * 0.3, t * 0.42, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.12)';
    ctx.beginPath();
    ctx.arc(px + t * 0.38, py + t * 0.2, t * 0.16, 0, Math.PI * 2);
    ctx.fill();
  }

  _drawRock(px, py) {
    const { ctx, tile: t } = this;
    ctx.fillStyle = '#8d9299';
    ctx.beginPath();
    ctx.ellipse(px + t * 0.5, py + t * 0.6, t * 0.34, t * 0.24, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  _drawProp(p, cx, cy) {
    const { ctx, tile: t } = this;
    const x = p.x * t - cx;
    const y = p.y * t - cy;
    const w = (p.w || 1) * t;
    const h = (p.h || 1) * t;

    switch (p.type) {
      case 'house': {
        // Corps
        ctx.fillStyle = p.palette.body;
        ctx.fillRect(x, y + h * 0.28, w, h * 0.72);
        // Toit
        ctx.fillStyle = p.palette.roof;
        ctx.beginPath();
        ctx.moveTo(x - t * 0.18, y + h * 0.32);
        ctx.lineTo(x + w * 0.5, y - t * 0.35);
        ctx.lineTo(x + w + t * 0.18, y + h * 0.32);
        ctx.closePath();
        ctx.fill();
        // Porte (au bas de la colonne doorX)
        const dx = (p.doorX - p.x) * t;
        ctx.fillStyle = '#4a3218';
        ctx.fillRect(x + dx + t * 0.12, y + h - t * 0.85, t * 0.76, t * 0.85);
        ctx.fillStyle = '#2c1e0e';
        ctx.fillRect(x + dx + t * 0.2, y + h - t * 0.75, t * 0.6, t * 0.75);
        // Fenêtres
        ctx.fillStyle = '#ffe9a8';
        for (let i = 0; i < (p.w || 1); i++) {
          if (p.x + i === p.doorX) continue;
          ctx.fillRect(x + i * t + t * 0.25, y + h * 0.5, t * 0.5, t * 0.4);
          ctx.strokeStyle = 'rgba(0,0,0,.3)';
          ctx.strokeRect(x + i * t + t * 0.25, y + h * 0.5, t * 0.5, t * 0.4);
        }
        // Enseigne
        if (p.label) {
          ctx.font = `600 ${Math.max(11, t * 0.22)}px system-ui`;
          const tw = ctx.measureText(p.label).width;
          ctx.fillStyle = 'rgba(12,16,22,.6)';
          ctx.fillRect(x + w / 2 - tw / 2 - 8, y + h * 0.05, tw + 16, t * 0.42);
          ctx.fillStyle = '#ffe9a8';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(p.label, x + w / 2, y + h * 0.05 + t * 0.21);
        }
        break;
      }
      case 'fountain': {
        ctx.fillStyle = '#9aa4b0';
        ctx.beginPath();
        ctx.arc(x + w / 2, y + h / 2, w * 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#4a90c2';
        ctx.beginPath();
        ctx.arc(x + w / 2, y + h / 2, w * 0.36, 0, Math.PI * 2);
        ctx.fill();
        const ph = performance.now() / 300;
        ctx.fillStyle = 'rgba(255,255,255,.7)';
        for (let i = 0; i < 5; i++) {
          const a = ph + (i * Math.PI * 2) / 5;
          ctx.beginPath();
          ctx.arc(x + w / 2 + Math.cos(a) * w * 0.15, y + h / 2 + Math.sin(a) * w * 0.15 - w * 0.08, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }
      case 'sign': {
        ctx.fillStyle = '#7a5230';
        ctx.fillRect(x + t * 0.42, y + t * 0.35, t * 0.16, t * 0.55);
        ctx.fillStyle = '#c8a06a';
        ctx.fillRect(x + t * 0.08, y + t * 0.08, t * 0.84, t * 0.4);
        ctx.strokeStyle = 'rgba(0,0,0,.35)';
        ctx.strokeRect(x + t * 0.08, y + t * 0.08, t * 0.84, t * 0.4);
        break;
      }
      case 'bed': {
        ctx.fillStyle = '#8a5a30';
        ctx.fillRect(x + 2, y + 2, w - 4, h - 4);
        ctx.fillStyle = '#d84f42';
        ctx.fillRect(x + 4, y + h * 0.3, w - 8, h * 0.65);
        ctx.fillStyle = '#f2f2f2';
        ctx.fillRect(x + 4, y + 4, w - 8, h * 0.22);
        break;
      }
      case 'table': {
        ctx.fillStyle = '#8a5a30';
        ctx.fillRect(x + 3, y + h * 0.2, w - 6, h * 0.6);
        ctx.fillStyle = 'rgba(0,0,0,.15)';
        ctx.fillRect(x + 3, y + h * 0.7, w - 6, h * 0.1);
        break;
      }
      case 'boardtable': {
        ctx.fillStyle = '#8a5a30';
        ctx.fillRect(x + 2, y + h * 0.15, w - 4, h * 0.75);
        // petit damier dessus
        const bs = Math.min(w - 12, t * 0.8);
        const bx = x + w / 2 - bs / 2;
        const by = y + h * 0.5 - bs / 2;
        for (let i = 0; i < 4; i++) {
          for (let j = 0; j < 4; j++) {
            ctx.fillStyle = (i + j) % 2 ? '#7a5230' : '#ecd9b4';
            ctx.fillRect(bx + i * (bs / 4), by + j * (bs / 4), bs / 4, bs / 4);
          }
        }
        ctx.strokeStyle = 'rgba(0,0,0,.4)';
        ctx.strokeRect(bx, by, bs, bs);
        break;
      }
      case 'shelf': {
        ctx.fillStyle = '#6e4622';
        ctx.fillRect(x + 2, y + 2, w - 4, h - 4);
        ctx.fillStyle = '#c85a4a';
        ctx.fillRect(x + 6, y + h * 0.2, w * 0.2, h * 0.5);
        ctx.fillStyle = '#4a78a8';
        ctx.fillRect(x + 6 + w * 0.25, y + h * 0.2, w * 0.18, h * 0.5);
        ctx.fillStyle = '#5f9a52';
        ctx.fillRect(x + 6 + w * 0.5, y + h * 0.2, w * 0.22, h * 0.5);
        break;
      }
      case 'counter': {
        ctx.fillStyle = '#8a5a30';
        ctx.fillRect(x + 2, y + h * 0.25, w - 4, h * 0.7);
        ctx.fillStyle = '#c8a06a';
        ctx.fillRect(x + 2, y + h * 0.25, w - 4, h * 0.18);
        break;
      }
      case 'plant': {
        ctx.fillStyle = '#a85a3c';
        ctx.fillRect(x + t * 0.3, y + t * 0.55, t * 0.4, t * 0.35);
        ctx.fillStyle = '#4a9a3e';
        ctx.beginPath();
        ctx.arc(x + t * 0.5, y + t * 0.38, t * 0.3, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'trophy': {
        ctx.fillStyle = '#6e4622';
        ctx.fillRect(x + 2, y + h * 0.3, w - 4, h * 0.65);
        ctx.fillStyle = '#f6d743';
        ctx.beginPath();
        ctx.arc(x + w / 2, y + h * 0.35, t * 0.22, 0, Math.PI, true);
        ctx.fill();
        ctx.fillRect(x + w / 2 - t * 0.05, y + h * 0.35, t * 0.1, t * 0.2);
        break;
      }
      case 'noticeboard': {
        ctx.fillStyle = '#6e4622';
        ctx.fillRect(x + 2, y + 4, w - 4, h - 8);
        ctx.fillStyle = '#e8dcc0';
        ctx.fillRect(x + 8, y + 8, w * 0.35, h * 0.5);
        ctx.fillStyle = '#c8e0f0';
        ctx.fillRect(x + w * 0.55, y + 10, w * 0.3, h * 0.45);
        break;
      }
      case 'mat': {
        ctx.fillStyle = 'rgba(180,120,60,.8)';
        ctx.fillRect(x + 4, y + 4, w - 8, h * 0.5);
        break;
      }
      default:
        ctx.fillStyle = '#888';
        ctx.fillRect(x, y, w, h);
    }

    // Enseigne générique au-dessus d'un meuble (les maisons ont la leur)
    if (p.label && p.type !== 'house') {
      ctx.font = `600 ${Math.max(11, t * 0.22)}px system-ui`;
      const tw = ctx.measureText(p.label).width;
      const lx = x + w / 2;
      const ly = y - t * 0.34;
      ctx.fillStyle = 'rgba(12,16,22,.65)';
      ctx.fillRect(lx - tw / 2 - 8, ly - t * 0.21, tw + 16, t * 0.42);
      ctx.fillStyle = '#ffe9a8';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(p.label, lx, ly);
    }
  }
}
