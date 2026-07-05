/**
 * Décor en PIXEL ART — tuiles de terrain, nature, bâtiments et mobilier,
 * générés au chargement (aucun fichier image), dans le même style rétro
 * GBA/DS que les personnages (pixelart.js).
 *
 * Principe : chaque tuile/sprite est peint sur une grille de 16 pixels
 * d'art par tuile, avec un « pinceau » à opérations ENTIÈRES (pixel,
 * rectangle, disque, ligne) ; le résultat est rendu une fois par échelle
 * entière dans un canvas hors écran puis affiché sans lissage.
 * La taille de tuile du monde est alignée sur un multiple de 16 pour que
 * chaque pixel d'art tombe exactement sur des pixels d'écran.
 */

// ---------------------------------------------------------------- palette
export const PX = {
  grass: '#7fc25a', grassL: '#95d46e', grassD: '#6aab48', grassDD: '#5c9a3e',
  path: '#e9d5a0', pathD: '#d3b87c', pathE: '#b99b5e',
  sand: '#f0e0ae', sandD: '#ddc78a',
  water: '#4fb3e5', waterL: '#8ed4f2', waterD: '#3d92c4', foam: '#eaf7fb',
  floor: '#d8ab6e', floorD: '#b98d52', floorL: '#e6c088',
  carpet: '#b0533f', carpetL: '#c46a52', carpetD: '#8f4030',
  wall: '#8a7360', wallT: '#6e5a4a', wallD: '#57493c', wallL: '#9c8570',
  void: '#0c0f14',
  trunk: '#8a5a33', trunkD: '#6e4426',
  leaf: '#3f9142', leafM: '#55ad4f', leafL: '#74c765', leafD: '#337736',
  stone: '#9aa0a8', stoneL: '#bcc2ca', stoneD: '#7c828a',
  wood: '#8a5a30', woodD: '#6e4622', woodL: '#a8763f',
  dark: '#3a2a1a',
  white: '#f5f5f5',
  glass: '#ffe9a8', glassL: '#fff6d8',
  gold: '#f2c94c', goldD: '#c99a2e',
  slate: '#2e4038', chalk: '#e8e4d8',
  paper: '#efe6cc', paperB: '#cfe2f0',
  shadow: 'rgba(20,60,20,.28)',
};

/** Pinceau à pixels entiers sur un canvas mis à l'échelle. */
function painter(ctx, scale) {
  return {
    px(x, y, c) {
      ctx.fillStyle = c;
      ctx.fillRect(x * scale, y * scale, scale, scale);
    },
    rect(x, y, w, h, c) {
      ctx.fillStyle = c;
      ctx.fillRect(x * scale, y * scale, w * scale, h * scale);
    },
    /** Disque plein à pixels entiers (cercle de milieu de pixel). */
    disc(cx, cy, r, c) {
      ctx.fillStyle = c;
      for (let y = Math.floor(cy - r); y <= Math.ceil(cy + r); y++) {
        for (let x = Math.floor(cx - r); x <= Math.ceil(cx + r); x++) {
          const dx = x + 0.5 - cx;
          const dy = y + 0.5 - cy;
          if (dx * dx + dy * dy <= r * r) ctx.fillRect(x * scale, y * scale, scale, scale);
        }
      }
    },
    hline(x1, x2, y, c) {
      this.rect(Math.min(x1, x2), y, Math.abs(x2 - x1) + 1, 1, c);
    },
    vline(x, y1, y2, c) {
      this.rect(x, Math.min(y1, y2), 1, Math.abs(y2 - y1) + 1, c);
    },
  };
}

function makeCanvas(wPx, hPx, scale) {
  const c = document.createElement('canvas');
  c.width = wPx * scale;
  c.height = hPx * scale;
  return c;
}

// ---------------------------------------------------------------------------
// TUILES DE TERRAIN — 16×16, accents posés à pixels fixes (déterministes
// par variante pour casser la répétition sans bruit à l'écran).
// ---------------------------------------------------------------------------
const TILES = {
  grass(scale, v) {
    const c = makeCanvas(16, 16, scale);
    const p = painter(c.getContext('2d'), scale);
    p.rect(0, 0, 16, 16, v % 2 ? PX.grass : PX.grassD ? PX.grass : PX.grass);
    p.rect(0, 0, 16, 16, PX.grass);
    if (v % 2) p.rect(0, 0, 16, 16, 'rgba(255,255,255,.04)');
    // triangles d'herbe façon AC (positions fixes par variante)
    const spots = v % 2
      ? [[3, 4], [11, 2], [7, 9], [13, 12], [2, 13]]
      : [[5, 3], [12, 6], [3, 9], [9, 13]];
    for (const [x, y] of spots) {
      p.px(x, y, PX.grassL);
      p.px(x + 1, y, PX.grassL);
      p.px(x, y - 1, PX.grassL);
    }
    p.px(v % 2 ? 8 : 14, v % 2 ? 14 : 10, PX.grassDD);
    return c;
  },
  grassdark(scale) {
    const c = makeCanvas(16, 16, scale);
    const p = painter(c.getContext('2d'), scale);
    p.rect(0, 0, 16, 16, PX.grassD);
    for (const [x, y] of [[4, 5], [10, 3], [6, 11], [13, 9]]) {
      p.px(x, y, PX.grass);
      p.px(x + 1, y, PX.grass);
    }
    p.px(12, 13, PX.grassDD);
    return c;
  },
  path(scale, v) {
    const c = makeCanvas(16, 16, scale);
    const p = painter(c.getContext('2d'), scale);
    p.rect(0, 0, 16, 16, PX.path);
    const spots = v % 2 ? [[3, 3], [10, 7], [6, 12]] : [[12, 4], [4, 8], [9, 13]];
    for (const [x, y] of spots) {
      p.px(x, y, PX.pathD);
      p.px(x + 1, y + 1, PX.pathD);
    }
    return c;
  },
  sand(scale) {
    const c = makeCanvas(16, 16, scale);
    const p = painter(c.getContext('2d'), scale);
    p.rect(0, 0, 16, 16, PX.sand);
    for (const [x, y] of [[5, 4], [11, 9], [3, 12], [13, 3]]) p.px(x, y, PX.sandD);
    return c;
  },
  water(scale, frame) {
    const c = makeCanvas(16, 16, scale);
    const p = painter(c.getContext('2d'), scale);
    p.rect(0, 0, 16, 16, PX.water);
    p.rect(0, 10, 16, 6, PX.waterD);
    const off = frame ? 4 : 0;
    p.hline(2 + off, 6 + off, 4, PX.waterL);
    p.hline(9 - off + 4, 12, 8, PX.waterL);
    p.hline(4 + off, 6 + off, 13, PX.waterL);
    return c;
  },
  floor(scale, v) {
    const c = makeCanvas(16, 16, scale);
    const p = painter(c.getContext('2d'), scale);
    p.rect(0, 0, 16, 16, PX.floor);
    p.hline(0, 15, 7, PX.floorD);
    p.hline(0, 15, 15, PX.floorD);
    p.vline(v % 2 ? 4 : 10, 0, 6, PX.floorD);
    p.vline(v % 2 ? 12 : 6, 8, 14, PX.floorD);
    p.hline(1, 3, 2, PX.floorL);
    return c;
  },
  carpet(scale) {
    const c = makeCanvas(16, 16, scale);
    const p = painter(c.getContext('2d'), scale);
    p.rect(0, 0, 16, 16, PX.carpet);
    p.px(7, 7, PX.carpetD);
    p.px(8, 8, PX.carpetD);
    p.px(8, 7, PX.carpetL);
    p.px(7, 8, PX.carpetL);
    return c;
  },
  wall(scale) {
    const c = makeCanvas(16, 16, scale);
    const p = painter(c.getContext('2d'), scale);
    p.rect(0, 0, 16, 16, PX.wall);
    p.rect(0, 0, 16, 5, PX.wallT);
    p.hline(0, 15, 5, PX.wallL);
    p.rect(0, 14, 16, 2, PX.wallD);
    p.px(3, 9, PX.wallL);
    p.px(11, 11, PX.wallD);
    return c;
  },
  void(scale) {
    const c = makeCanvas(16, 16, scale);
    painter(c.getContext('2d'), scale).rect(0, 0, 16, 16, PX.void);
    return c;
  },
  // Fleurs posées PAR-DESSUS une tuile d'herbe (fond transparent)
  flowertile(scale, v) {
    return SPRITES.flower(scale, v);
  },
  // Coin d'herbe arrondi posé PAR-DESSUS un chemin (rotation via paramètre v)
  pathcorner(scale, v) {
    const c = makeCanvas(16, 16, scale);
    const p = painter(c.getContext('2d'), scale);
    // quart de cercle d'herbe dans le coin haut-gauche, puis rotation
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const dx = 6.5 - x;
        const dy = 6.5 - y;
        if (dx > 0 && dy > 0 && dx * dx + dy * dy > 42) {
          let [tx, ty] = [x, y];
          if (v === 1) [tx, ty] = [15 - y, x];
          else if (v === 2) [tx, ty] = [15 - x, 15 - y];
          else if (v === 3) [tx, ty] = [y, 15 - x];
          p.px(tx, ty, PX.grass);
          // liseré de bord de chemin
        }
      }
    }
    return c;
  },
  // Écume de rive (bord haut ; rotations pour les autres côtés)
  shore(scale, v) {
    const c = makeCanvas(16, 16, scale);
    const p = painter(c.getContext('2d'), scale);
    for (let x = 0; x < 16; x++) {
      const h = 1 + ((x >> 2) % 2);
      for (let y = 0; y < h; y++) {
        let [tx, ty] = [x, y];
        if (v === 1) [tx, ty] = [15 - y, x];
        else if (v === 2) [tx, ty] = [15 - x, 15 - y];
        else if (v === 3) [tx, ty] = [y, 15 - x];
        p.px(tx, ty, PX.foam);
      }
    }
    return c;
  },
};

const tileCache = new Map();

/** Dessine une tuile de terrain pixel art (size = côté en px écran). */
export function drawPixelTile(ctx, name, px, py, size, variant = 0) {
  const scale = Math.max(1, Math.round(size / 16));
  const key = `${name}|${scale}|${variant}`;
  let c = tileCache.get(key);
  if (!c) {
    c = TILES[name](scale, variant);
    tileCache.set(key, c);
  }
  const prev = ctx.imageSmoothingEnabled;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(c, px, py, size, size);
  ctx.imageSmoothingEnabled = prev;
}

// ---------------------------------------------------------------------------
// SPRITES DE NATURE ET MOBILIER — peints en pixels entiers, cache par échelle.
// Chaque fabrique renvoie un canvas ; l'ancrage est géré par l'appelant.
// ---------------------------------------------------------------------------
const SPRITES = {
  tree(scale) {
    const c = makeCanvas(24, 30, scale);
    const p = painter(c.getContext('2d'), scale);
    // tronc
    p.rect(10, 20, 4, 8, PX.trunk);
    p.rect(10, 20, 1, 8, PX.trunkD);
    p.rect(8, 26, 8, 2, PX.trunkD);
    // feuillage étagé (brocoli)
    p.disc(12, 14, 8.2, PX.leafD);
    p.disc(7, 13, 5.4, PX.leaf);
    p.disc(17, 13, 5.4, PX.leaf);
    p.disc(12, 8, 6.4, PX.leafM);
    p.disc(12, 6, 4.6, PX.leafL);
    p.px(9, 4, PX.white);
    p.px(10, 4, PX.white);
    p.px(9, 5, PX.white);
    p.px(15, 8, 'rgba(255,255,255,.5)');
    return c;
  },
  rock(scale) {
    const c = makeCanvas(16, 12, scale);
    const p = painter(c.getContext('2d'), scale);
    p.disc(8, 7, 5.4, PX.stoneD);
    p.disc(7.5, 6, 4.8, PX.stone);
    p.disc(6, 5, 2.2, PX.stoneL);
    return c;
  },
  flower(scale, v) {
    const c = makeCanvas(16, 16, scale);
    const p = painter(c.getContext('2d'), scale);
    const petals = ['#f2789e', '#f6d048', '#f5f5f5'][v % 3];
    const at = [[4, 5], [11, 9]];
    for (const [fx, fy] of at) {
      p.vline(fx, fy + 2, fy + 5, PX.leafD);
      p.px(fx - 1, fy, petals);
      p.px(fx + 1, fy, petals);
      p.px(fx, fy - 1, petals);
      p.px(fx, fy + 1, petals);
      p.px(fx, fy, PX.gold);
    }
    return c;
  },
  fountain(scale, frame) {
    const c = makeCanvas(32, 32, scale);
    const p = painter(c.getContext('2d'), scale);
    p.disc(16, 16, 15, PX.stoneD);
    p.disc(16, 16, 13.4, PX.stone);
    p.disc(16, 15, 11.2, PX.stoneL);
    p.disc(16, 16, 10, PX.waterD);
    p.disc(16, 15.4, 8.6, PX.water);
    // jet central et gouttes (2 frames)
    p.rect(15, 8, 2, 8, PX.waterL);
    p.disc(16, 7, 2.2, PX.foam);
    const drops = frame ? [[10, 12], [22, 13], [16, 19]] : [[12, 18], [20, 11], [13, 10]];
    for (const [x, y] of drops) p.px(x, y, PX.foam);
    p.hline(9, 13, 16, PX.waterL);
    return c;
  },
  sign(scale) {
    const c = makeCanvas(16, 16, scale);
    const p = painter(c.getContext('2d'), scale);
    p.rect(7, 8, 2, 7, PX.trunk);
    p.rect(2, 2, 12, 7, PX.wood);
    p.rect(2, 2, 12, 1, PX.woodL);
    p.rect(2, 8, 12, 1, PX.woodD);
    p.hline(4, 11, 4, PX.dark);
    p.hline(4, 9, 6, PX.dark);
    return c;
  },
  bed(scale) {
    const c = makeCanvas(16, 32, scale);
    const p = painter(c.getContext('2d'), scale);
    p.rect(1, 1, 14, 30, PX.woodD);
    p.rect(2, 2, 12, 28, PX.wood);
    p.rect(2, 8, 12, 20, '#c8534a');           // couette
    p.rect(2, 8, 12, 2, '#a83c34');
    p.rect(2, 26, 12, 2, '#a83c34');
    p.rect(3, 3, 10, 4, PX.white);              // oreiller
    p.rect(3, 6, 10, 1, '#d8d8d8');
    return c;
  },
  shelf(scale, wTiles = 2) {
    const w = wTiles * 16;
    const c = makeCanvas(w, 16, scale);
    const p = painter(c.getContext('2d'), scale);
    p.rect(0, 1, w, 15, PX.woodD);
    p.rect(1, 2, w - 2, 13, PX.wood);
    p.rect(1, 7, w - 2, 1, PX.woodD);
    // livres
    const cols = ['#c85a4a', '#4a78a8', '#5f9a52', '#c8a03c', '#8a5f9a'];
    for (let i = 0; i < wTiles * 4; i++) {
      p.rect(3 + i * 4, 3, 3, 4, cols[i % cols.length]);
      p.rect(3 + i * 4, 9, 3, 5, cols[(i + 2) % cols.length]);
    }
    return c;
  },
  table(scale) {
    const c = makeCanvas(32, 16, scale);
    const p = painter(c.getContext('2d'), scale);
    p.rect(2, 3, 28, 9, PX.woodL);
    p.rect(2, 3, 28, 2, PX.wood);
    p.rect(3, 12, 3, 3, PX.woodD);
    p.rect(26, 12, 3, 3, PX.woodD);
    return c;
  },
  boardtable(scale) {
    const c = makeCanvas(32, 16, scale);
    const p = painter(c.getContext('2d'), scale);
    p.rect(1, 2, 30, 11, PX.wood);
    p.rect(1, 2, 30, 1, PX.woodL);
    p.rect(2, 13, 3, 2, PX.woodD);
    p.rect(27, 13, 3, 2, PX.woodD);
    // damier 8×4 posé dessus
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 4; j++) {
        p.rect(8 + i * 2, 4 + j * 2, 2, 2, (i + j) % 2 ? '#7a5230' : '#ecd9b4');
      }
    }
    p.rect(7, 3, 18, 1, PX.dark);
    p.rect(7, 12, 18, 1, PX.dark);
    p.vline(7, 3, 12, PX.dark);
    p.vline(24, 3, 12, PX.dark);
    return c;
  },
  counter(scale, wTiles = 6) {
    const w = wTiles * 16;
    const c = makeCanvas(w, 16, scale);
    const p = painter(c.getContext('2d'), scale);
    p.rect(0, 4, w, 11, PX.wood);
    p.rect(0, 4, w, 3, PX.woodL);
    p.rect(0, 14, w, 1, PX.woodD);
    for (let i = 1; i < wTiles; i++) p.vline(i * 16, 8, 13, PX.woodD);
    return c;
  },
  plant(scale) {
    const c = makeCanvas(16, 16, scale);
    const p = painter(c.getContext('2d'), scale);
    p.rect(5, 10, 6, 5, '#a85a3c');
    p.rect(5, 10, 6, 1, '#8a4630');
    p.disc(8, 6, 4.2, PX.leafM);
    p.disc(5.5, 7.5, 2.4, PX.leaf);
    p.disc(10.5, 7.5, 2.4, PX.leafL);
    return c;
  },
  trophy(scale) {
    const c = makeCanvas(32, 16, scale);
    const p = painter(c.getContext('2d'), scale);
    p.rect(1, 2, 30, 13, PX.woodD);
    p.rect(2, 3, 28, 11, PX.wood);
    // coupe dorée
    p.rect(13, 4, 6, 4, PX.gold);
    p.rect(12, 4, 1, 3, PX.gold);
    p.rect(19, 4, 1, 3, PX.gold);
    p.rect(15, 8, 2, 2, PX.goldD);
    p.rect(13, 10, 6, 1, PX.goldD);
    p.px(14, 5, '#fff');
    return c;
  },
  noticeboard(scale) {
    const c = makeCanvas(32, 16, scale);
    const p = painter(c.getContext('2d'), scale);
    p.rect(1, 1, 30, 14, PX.woodD);
    p.rect(2, 2, 28, 12, PX.wood);
    p.rect(4, 4, 10, 8, PX.paper);
    p.rect(18, 4, 9, 7, PX.paperB);
    p.hline(6, 11, 6, PX.dark);
    p.hline(6, 10, 8, PX.dark);
    p.px(8, 3, '#c84a4a');
    p.px(22, 3, '#c84a4a');
    return c;
  },
  blackboard(scale) {
    const c = makeCanvas(32, 16, scale);
    const p = painter(c.getContext('2d'), scale);
    p.rect(1, 1, 30, 14, PX.woodD);
    p.rect(3, 2, 26, 11, PX.slate);
    // petit damier et flèche à la craie
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if ((i + j) % 2) p.px(6 + i, 5 + j, PX.chalk);
      }
    }
    p.px(14, 8, PX.chalk);
    p.px(15, 7, PX.chalk);
    p.px(16, 6, PX.chalk);
    p.px(17, 5, PX.chalk);
    p.px(16, 5, PX.chalk);
    p.px(17, 6, PX.chalk);
    p.hline(21, 25, 7, PX.chalk);
    p.rect(4, 13, 5, 1, PX.wood);
    p.rect(22, 13, 3, 1, PX.chalk);
    return c;
  },
  mat(scale) {
    const c = makeCanvas(32, 16, scale);
    const p = painter(c.getContext('2d'), scale);
    p.rect(3, 4, 26, 9, '#b4783c');
    p.rect(4, 5, 24, 7, '#c88a48');
    p.hline(6, 25, 8, '#b4783c');
    return c;
  },
};

const spriteCache = new Map();

export function pixelSprite(name, scale, variant = 0) {
  const key = `${name}|${scale}|${variant}`;
  let c = spriteCache.get(key);
  if (!c) {
    c = SPRITES[name](scale, variant);
    spriteCache.set(key, c);
  }
  return c;
}

/** Dessine un sprite avec ancrage bas-centre sur (x, y) en px écran. */
export function drawPixelSprite(ctx, name, x, y, size, variant = 0) {
  const scale = Math.max(1, Math.round(size / 16));
  const c = pixelSprite(name, scale, variant);
  const prev = ctx.imageSmoothingEnabled;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(c, Math.round(x - c.width / 2), Math.round(y - c.height));
  ctx.imageSmoothingEnabled = prev;
}

// ---------------------------------------------------------------------------
// MAISONS — assemblées en pixels, paramétriques (taille, couleurs, porte).
// Le canvas rendu fait (w*16 + 8) de large : le toit déborde de 4 px d'art
// de chaque côté ; il s'étend de 8 px au-dessus du corps.
// ---------------------------------------------------------------------------
function buildHouse(wT, hT, palette, doorCol, scale) {
  const W = wT * 16 + 8;
  const roofH = 14;
  const H = hT * 16 + 8;
  const c = makeCanvas(W, H, scale);
  const p = painter(c.getContext('2d'), scale);
  const body = palette.body;
  const bodyD = shadeHex(body, -0.22);
  const roof = palette.roof;
  const roofD = shadeHex(roof, -0.28);
  const roofL = shadeHex(roof, 0.22);
  const top = H - hT * 16 + 2; // haut du corps

  // corps
  p.rect(4, top, wT * 16, H - top, body);
  p.rect(4, top, wT * 16, 2, bodyD);
  p.rect(4, H - 2, wT * 16, 2, bodyD);
  p.vline(4, top, H - 1, bodyD);
  p.vline(3 + wT * 16, top, H - 1, bodyD);

  // toit en escalier (pignon pixelisé)
  const ridgeY = top - roofH;
  for (let r = 0; r < roofH; r++) {
    const inset = Math.max(0, Math.round(((roofH - 1 - r) * (W / 2 - 3)) / roofH));
    p.hline(inset, W - 1 - inset, ridgeY + r, roof);
    p.px(inset, ridgeY + r, roofD);
    p.px(W - 1 - inset, ridgeY + r, roofD);
    if (r > 1) p.px(inset + 1, ridgeY + r, roofL);
  }
  p.hline(0, W - 1, ridgeY + roofH, roofD);
  p.hline(0, W - 1, ridgeY + roofH + 1, roofD);

  // porte en arche
  const dx = 4 + doorCol * 16 + 3;
  const doorTop = H - 13;
  p.rect(dx, doorTop + 2, 10, 11, PX.woodD);
  p.rect(dx + 1, doorTop + 3, 8, 10, PX.trunk);
  p.hline(dx + 2, dx + 7, doorTop + 1, PX.woodD);
  p.hline(dx + 3, dx + 6, doorTop, PX.woodD);
  p.hline(dx + 3, dx + 6, doorTop + 2, PX.trunk);
  p.px(dx + 7, doorTop + 7, PX.gold);

  // fenêtres sur les colonnes sans porte
  for (let i = 0; i < wT; i++) {
    if (i === doorCol) continue;
    const wx = 4 + i * 16 + 4;
    const wy = H - 12;
    p.rect(wx - 1, wy - 1, 10, 9, PX.white);
    p.rect(wx, wy, 8, 7, PX.glass);
    p.rect(wx, wy, 3, 3, PX.glassL);
    p.vline(wx + 4, wy, wy + 6, PX.white);
    p.hline(wx, wx + 7, wy + 3, PX.white);
  }
  return c;
}

function shadeHex(hex, f) {
  const n = parseInt(hex.slice(1), 16);
  const ch = (v) => Math.max(0, Math.min(255, Math.round(f < 0 ? v * (1 + f) : v + (255 - v) * f)));
  return `rgb(${ch((n >> 16) & 255)},${ch((n >> 8) & 255)},${ch(n & 255)})`;
}

const houseCache = new Map();

/**
 * Dessine une maison pixel art. (x, y) = coin haut-gauche de l'emprise en
 * tuiles (px écran), w/h en tuiles, size = taille de tuile écran.
 */
export function drawPixelHouse(ctx, x, y, wT, hT, palette, doorCol, size) {
  const scale = Math.max(1, Math.round(size / 16));
  const key = `${wT}|${hT}|${palette.body}|${palette.roof}|${doorCol}|${scale}`;
  let c = houseCache.get(key);
  if (!c) {
    c = buildHouse(wT, hT, palette, doorCol, scale);
    houseCache.set(key, c);
  }
  const prev = ctx.imageSmoothingEnabled;
  ctx.imageSmoothingEnabled = false;
  // aligné pour que le corps couvre l'emprise : le débord (4 px d'art) à
  // gauche et les 8 px de toit au-dessus sortent de la boîte.
  ctx.drawImage(c, Math.round(x - 4 * scale), Math.round(y + hT * size - c.height));
  ctx.imageSmoothingEnabled = prev;
}
