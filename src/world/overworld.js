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
import { drawCharacterSprite } from './pixelart.js';

const DIRS = {
  up: { x: 0, y: -1 }, down: { x: 0, y: 1 },
  left: { x: -1, y: 0 }, right: { x: 1, y: 0 },
};

// Palette « Animal Crossing » : verts jaunes chaleureux, sable doux, eau vive.
const PAL = {
  grass: '#8cc55a', grassAlt: '#85bd54', grassTri: '#9dd36c', grassDark: '#76ad47',
  path: '#e9d5a0', pathSpeckle: '#d8bd80', pathEdge: '#cfb173',
  sand: '#f0e0ae',
  water: '#57b8e8', waterDeep: '#3d9bd6', foam: 'rgba(255,255,255,.75)',
  wallTop: '#6e5a4a', wall: '#8a7360', plinth: '#5d4c3e',
  floor: '#d8ab6e', floorLine: '#c1955a',
  carpet: '#b0533f', carpetIn: '#bd6350', carpetDot: '#a34738',
  void: '#0c0f14',
};

/** Couleur de base d'une tuile (le détail est dessiné par _drawTile). */
const TILE_COLORS = {
  '.': PAL.grass, ',': PAL.grassAlt, f: PAL.grass, p: PAL.path, s: PAL.sand,
  t: PAL.grass, w: PAL.water, r: PAL.grass,
  W: PAL.wall, F: PAL.floor, c: PAL.carpet, x: PAL.void,
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
    ctx.fillStyle = this.map.outdoor ? PAL.grassDark : PAL.void;
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
        ctx.fillStyle = TILE_COLORS[c] || PAL.grass;
        ctx.fillRect(px, py, t + 1, t + 1);
        const h = ((x * 73856093) ^ (y * 19349663)) >>> 0;

        // Herbe façon Animal Crossing : damier doux + petits triangles clairs
        if (c === '.' || c === ',' || c === 'f' || c === 't' || c === 'r') {
          if ((x + y) % 2 === 0) {
            ctx.fillStyle = 'rgba(255,255,255,.045)';
            ctx.fillRect(px, py, t + 1, t + 1);
          }
          ctx.fillStyle = PAL.grassTri;
          const n = 2 + (h % 2);
          for (let i = 0; i < n; i++) {
            const gx = px + (((h >> (i * 4)) % 8) / 8) * t + t * 0.06;
            const gy = py + (((h >> (i * 4 + 3)) % 8) / 8) * t + t * 0.06;
            const s2 = t * 0.075;
            ctx.beginPath();
            ctx.moveTo(gx, gy + s2);
            ctx.lineTo(gx + s2, gy + s2);
            ctx.lineTo(gx + s2 / 2, gy);
            ctx.closePath();
            ctx.fill();
          }
          if (c === ',') {
            ctx.fillStyle = 'rgba(0,60,0,.06)';
            ctx.fillRect(px, py, t + 1, t + 1);
          }
        }
        if (c === 'f') this._drawFlower(px, py, h);

        // Chemins : angles arrondis contre l'herbe + gravillons
        if (c === 'p' || c === 's') {
          const isPath = (xx, yy) => {
            if (yy < 0 || yy >= this.H || xx < 0 || xx >= this.W) return true;
            const g = this.grid[yy][xx];
            return g === 'p' || g === 's';
          };
          // fond herbe, puis pastille de chemin aux coins arrondis
          ctx.fillStyle = PAL.grass;
          ctx.fillRect(px, py, t + 1, t + 1);
          const r = t * 0.38;
          const radii = [
            !isPath(x - 1, y) && !isPath(x, y - 1) ? r : 0,
            !isPath(x + 1, y) && !isPath(x, y - 1) ? r : 0,
            !isPath(x + 1, y) && !isPath(x, y + 1) ? r : 0,
            !isPath(x - 1, y) && !isPath(x, y + 1) ? r : 0,
          ];
          ctx.fillStyle = TILE_COLORS[c];
          ctx.beginPath();
          ctx.roundRect(px - 0.5, py - 0.5, t + 1.5, t + 1.5, radii);
          ctx.fill();
          ctx.fillStyle = PAL.pathSpeckle;
          for (let i = 0; i < 3; i++) {
            const sx = px + (((h >> (i * 5)) % 16) / 16) * t;
            const sy = py + (((h >> (i * 5 + 2)) % 16) / 16) * t;
            ctx.beginPath();
            ctx.arc(sx + t * 0.1, sy + t * 0.1, t * 0.035, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Eau : profondeur, reflets animés, écume contre les berges
        if (c === 'w') {
          const g2 = ctx.createLinearGradient(px, py, px, py + t);
          g2.addColorStop(0, PAL.water);
          g2.addColorStop(1, PAL.waterDeep);
          ctx.fillStyle = g2;
          ctx.fillRect(px, py, t + 1, t + 1);
          const ph = (performance.now() / 900 + (x * 1.7 + y) * 0.9) % (Math.PI * 2);
          ctx.strokeStyle = 'rgba(255,255,255,.35)';
          ctx.lineWidth = Math.max(1.5, t * 0.04);
          ctx.beginPath();
          const wy = py + t * (0.35 + Math.sin(ph) * 0.12);
          ctx.moveTo(px + t * 0.12, wy);
          ctx.quadraticCurveTo(px + t * 0.35, wy - t * 0.08, px + t * 0.55, wy);
          ctx.stroke();
          const isWater = (xx, yy) => yy >= 0 && yy < this.H && xx >= 0 && xx < this.W && this.grid[yy][xx] === 'w';
          ctx.fillStyle = PAL.foam;
          const f2 = Math.max(2, t * 0.07);
          if (!isWater(x, y - 1)) ctx.fillRect(px, py, t + 1, f2);
          if (!isWater(x, y + 1)) ctx.fillRect(px, py + t - f2, t + 1, f2);
          if (!isWater(x - 1, y)) ctx.fillRect(px, py, f2, t + 1);
          if (!isWater(x + 1, y)) ctx.fillRect(px + t - f2, py, f2, t + 1);
        }

        // Intérieurs : plancher à lames, tapis à motif, murs à plinthe
        if (c === 'F') {
          ctx.strokeStyle = PAL.floorLine;
          ctx.lineWidth = 1;
          ctx.globalAlpha = 0.55;
          ctx.beginPath();
          ctx.moveTo(px, py + t * 0.5);
          ctx.lineTo(px + t, py + t * 0.5);
          ctx.moveTo(px + (y % 2 ? t * 0.5 : t * 0.2), py);
          ctx.lineTo(px + (y % 2 ? t * 0.5 : t * 0.2), py + t * 0.5);
          ctx.moveTo(px + (y % 2 ? t * 0.15 : t * 0.7), py + t * 0.5);
          ctx.lineTo(px + (y % 2 ? t * 0.15 : t * 0.7), py + t);
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
        if (c === 'c') {
          ctx.fillStyle = PAL.carpetIn;
          ctx.fillRect(px + 2, py + 2, t - 4, t - 4);
          ctx.fillStyle = PAL.carpetDot;
          ctx.beginPath();
          ctx.arc(px + t * 0.5, py + t * 0.5, t * 0.06, 0, Math.PI * 2);
          ctx.fill();
        }
        if (c === 'W') {
          // Mur : bandeau haut sombre + plinthe, sans quadrillage dur
          ctx.fillStyle = PAL.wallTop;
          ctx.fillRect(px, py, t + 1, t * 0.35);
          ctx.fillStyle = 'rgba(255,255,255,.06)';
          ctx.fillRect(px, py + t * 0.35, t + 1, t * 0.08);
          ctx.fillStyle = PAL.plinth;
          ctx.fillRect(px, py + t * 0.88, t + 1, t * 0.12);
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
        drawCharacterSprite(ctx, d.n.look, d.n.x * t - cx, d.n.y * t - cy, t, d.n.dir, d.n.walking ? d.n.step : 0);
      } else {
        const look = this.hooks.playerLook?.() || characterById('player').look;
        const p = this.player;
        drawCharacterSprite(ctx, look, p.x * t - cx, p.y * t - cy, t, p.dir, p.walking ? p.step : 0);
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
    // Arbre « brocoli » façon Animal Crossing : ombre douce, tronc évasé,
    // canopée en trois étages avec liseré sombre et éclats de lumière.
    const { ctx, tile: t } = this;
    const cxp = px + t * 0.5;
    ctx.fillStyle = 'rgba(20,60,20,.22)';
    ctx.beginPath();
    ctx.ellipse(cxp, py + t * 0.92, t * 0.4, t * 0.14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#8a5a33';
    ctx.beginPath();
    ctx.moveTo(cxp - t * 0.09, py + t * 0.45);
    ctx.lineTo(cxp - t * 0.14, py + t * 0.92);
    ctx.lineTo(cxp + t * 0.14, py + t * 0.92);
    ctx.lineTo(cxp + t * 0.09, py + t * 0.45);
    ctx.closePath();
    ctx.fill();
    // Étages de feuillage (du plus sombre au plus clair)
    const blob = (ox, oy, r, color) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(cxp + ox, py + oy, r, 0, Math.PI * 2);
      ctx.fill();
    };
    blob(-t * 0.24, t * 0.42, t * 0.3, '#3d8a3f');
    blob(t * 0.24, t * 0.42, t * 0.3, '#3d8a3f');
    blob(0, t * 0.5, t * 0.32, '#3d8a3f');
    blob(-t * 0.18, t * 0.28, t * 0.28, '#4fa64c');
    blob(t * 0.18, t * 0.28, t * 0.28, '#4fa64c');
    blob(0, t * 0.12, t * 0.3, '#5cb857');
    // Éclats de lumière
    ctx.fillStyle = 'rgba(255,255,255,.28)';
    ctx.beginPath();
    ctx.arc(cxp - t * 0.12, py + t * 0.05, t * 0.09, 0, Math.PI * 2);
    ctx.arc(cxp + t * 0.16, py + t * 0.2, t * 0.06, 0, Math.PI * 2);
    ctx.fill();
  }

  _drawRock(px, py) {
    const { ctx, tile: t } = this;
    ctx.fillStyle = 'rgba(20,60,20,.2)';
    ctx.beginPath();
    ctx.ellipse(px + t * 0.5, py + t * 0.78, t * 0.34, t * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#9aa0a8';
    ctx.beginPath();
    ctx.ellipse(px + t * 0.5, py + t * 0.58, t * 0.32, t * 0.24, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#b4bac2';
    ctx.beginPath();
    ctx.ellipse(px + t * 0.42, py + t * 0.5, t * 0.16, t * 0.1, -0.4, 0, Math.PI * 2);
    ctx.fill();
  }

  _drawFlower(px, py, h) {
    // Fleur à pétales : tige, corolle de 5 pétales, cœur doré.
    const { ctx, tile: t } = this;
    const fx = px + t * (0.3 + ((h >> 3) % 5) * 0.1);
    const fy = py + t * (0.35 + ((h >> 6) % 4) * 0.1);
    ctx.strokeStyle = '#4d8a3c';
    ctx.lineWidth = Math.max(1.5, t * 0.04);
    ctx.beginPath();
    ctx.moveTo(fx, fy + t * 0.08);
    ctx.lineTo(fx, fy + t * 0.3);
    ctx.stroke();
    const petal = ['#f2789e', '#f6d048', '#f5f5f5', '#e88ac8'][h % 4];
    ctx.fillStyle = petal;
    for (let i = 0; i < 5; i++) {
      const a = (i * Math.PI * 2) / 5 + (h % 7);
      ctx.beginPath();
      ctx.ellipse(fx + Math.cos(a) * t * 0.075, fy + Math.sin(a) * t * 0.075, t * 0.055, t * 0.04, a, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#f6b73c';
    ctx.beginPath();
    ctx.arc(fx, fy, t * 0.04, 0, Math.PI * 2);
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
        // Ombre au sol
        ctx.fillStyle = 'rgba(20,60,20,.18)';
        ctx.beginPath();
        ctx.ellipse(x + w / 2, y + h + t * 0.06, w * 0.52, t * 0.14, 0, 0, Math.PI * 2);
        ctx.fill();
        // Corps aux angles doux
        ctx.fillStyle = p.palette.body;
        ctx.beginPath();
        ctx.roundRect(x, y + h * 0.28, w, h * 0.72, [0, 0, 6, 6]);
        ctx.fill();
        ctx.fillStyle = 'rgba(0,0,0,.08)';
        ctx.fillRect(x, y + h * 0.28, w, h * 0.06);
        // Toit avec faîtage et liseré clair
        ctx.fillStyle = p.palette.roof;
        ctx.beginPath();
        ctx.moveTo(x - t * 0.2, y + h * 0.34);
        ctx.quadraticCurveTo(x - t * 0.05, y + h * 0.3, x + w * 0.12, y + h * 0.12);
        ctx.lineTo(x + w * 0.5, y - t * 0.38);
        ctx.lineTo(x + w * 0.88, y + h * 0.12);
        ctx.quadraticCurveTo(x + w + t * 0.05, y + h * 0.3, x + w + t * 0.2, y + h * 0.34);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,.25)';
        ctx.lineWidth = Math.max(2, t * 0.06);
        ctx.beginPath();
        ctx.moveTo(x + w * 0.5, y - t * 0.3);
        ctx.lineTo(x + w * 0.86, y + h * 0.12);
        ctx.stroke();
        // Porte en arche + poignée
        const dx = (p.doorX - p.x) * t;
        ctx.fillStyle = '#5d3d1e';
        ctx.beginPath();
        ctx.roundRect(x + dx + t * 0.1, y + h - t * 0.88, t * 0.8, t * 0.88, [t * 0.4, t * 0.4, 0, 0]);
        ctx.fill();
        ctx.fillStyle = '#7a5230';
        ctx.beginPath();
        ctx.roundRect(x + dx + t * 0.18, y + h - t * 0.78, t * 0.64, t * 0.78, [t * 0.32, t * 0.32, 0, 0]);
        ctx.fill();
        ctx.fillStyle = '#f2d27a';
        ctx.beginPath();
        ctx.arc(x + dx + t * 0.68, y + h - t * 0.36, t * 0.045, 0, Math.PI * 2);
        ctx.fill();
        // Fenêtres à cadre et reflet
        for (let i = 0; i < (p.w || 1); i++) {
          if (p.x + i === p.doorX) continue;
          const wx = x + i * t + t * 0.22;
          const wy = y + h * 0.48;
          ctx.fillStyle = '#fff';
          ctx.beginPath();
          ctx.roundRect(wx - 2, wy - 2, t * 0.56 + 4, t * 0.44 + 4, 5);
          ctx.fill();
          ctx.fillStyle = '#ffe9a8';
          ctx.beginPath();
          ctx.roundRect(wx, wy, t * 0.56, t * 0.44, 4);
          ctx.fill();
          ctx.fillStyle = 'rgba(255,255,255,.55)';
          ctx.beginPath();
          ctx.moveTo(wx + t * 0.08, wy + t * 0.44);
          ctx.lineTo(wx + t * 0.26, wy);
          ctx.lineTo(wx + t * 0.36, wy);
          ctx.lineTo(wx + t * 0.18, wy + t * 0.44);
          ctx.fill();
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
      case 'blackboard': {
        // Tableau noir de Gigi : cadre bois, ardoise, diagramme à la craie
        ctx.fillStyle = '#6e4622';
        ctx.fillRect(x + 2, y + 2, w - 4, h - 2);
        ctx.fillStyle = '#2e4038';
        ctx.fillRect(x + 6, y + 5, w - 12, h - 9);
        // petit damier à la craie
        ctx.strokeStyle = 'rgba(240,240,220,.8)';
        ctx.lineWidth = 1.2;
        const bs = Math.min(w - 24, t * 0.6);
        const bx = x + 10;
        const by = y + h * 0.5 - bs / 2;
        for (let i = 0; i <= 4; i++) {
          ctx.beginPath();
          ctx.moveTo(bx + (i * bs) / 4, by);
          ctx.lineTo(bx + (i * bs) / 4, by + bs);
          ctx.moveTo(bx, by + (i * bs) / 4);
          ctx.lineTo(bx + bs, by + (i * bs) / 4);
          ctx.stroke();
        }
        // flèche de combinaison
        ctx.beginPath();
        ctx.moveTo(bx + bs + 6, by + bs * 0.8);
        ctx.lineTo(bx + bs + t * 0.5, by + bs * 0.2);
        ctx.stroke();
        // craie et brosse sur la rainure
        ctx.fillStyle = '#e8e4d8';
        ctx.fillRect(x + w * 0.6, y + h - 6, t * 0.18, 3);
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
