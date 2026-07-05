/**
 * Sprites en PIXEL ART, dessinés pixel par pixel dans le code (style original
 * « rétro cosy », époque GBA/DS) et générés au chargement : aucun fichier
 * image, personnages paramétriques (couleurs/coiffures par fiche).
 *
 * Principe :
 * - chaque calque est une grille de caractères 16×24 (1 caractère = 1 pixel,
 *   '.' = transparent), rendue via une palette dérivée de la fiche du
 *   personnage (peau, cheveux, maillot…) ;
 * - un sprite = corps (direction + frame de marche) + coiffure + accessoires ;
 * - les vues « gauche » et les frames symétriques sont obtenues par MIROIR ;
 * - le tout est rendu une seule fois par échelle entière dans un canvas
 *   hors écran (netteté garantie), puis affiché par drawImage sans lissage.
 */

const SW = 16;  // largeur d'un sprite en pixels d'art
const SH = 24;  // hauteur

/** Assombrit/éclaircit une couleur hex (#rrggbb), f dans [-1..1]. */
function tone(hex, f) {
  const n = parseInt(hex.slice(1), 16);
  const ch = (v) => Math.max(0, Math.min(255, Math.round(f < 0 ? v * (1 + f) : v + (255 - v) * f)));
  return `rgb(${ch((n >> 16) & 255)},${ch((n >> 8) & 255)},${ch(n & 255)})`;
}

// ---------------------------------------------------------------------------
// CORPS — 16×24. Tête rangées 2-13, buste 14-18, jambes 19-23.
// Légende : O contour, S peau, W blanc (reflet), E œil, m bouche, b joue,
//           T maillot, t ombre maillot, P pantalon, B chaussure.
// ---------------------------------------------------------------------------
const BODY = {
  down_idle: [
    '................',
    '................',
    '.....OOOOOO.....',
    '...OOSSSSSSOO...',
    '..OSSSSSSSSSSO..',
    '.OSSSSSSSSSSSSO.',
    '.OSSSSSSSSSSSSO.',
    'OSSSWESSSSWESSSO',
    'OSSSEESSSSEESSSO',
    'OSSSEESSSSEESSSO',
    '.OSbSSSSSSSSbSO.',
    '.OSSSSSmmSSSSSO.',
    '..OSSSSSSSSSSO..',
    '...OOSSSSSSOO...',
    '..OOTTTTTTTTOO..',
    '.OTTTTTTTTTTTTO.',
    '.OTtTTTTTTTTtTO.',
    '.OSTTTTTTTTTTSO.',
    '..OTTTTTTTTTTO..',
    '....PPP..PPP....',
    '....PPP..PPP....',
    '....PPP..PPP....',
    '...BBBB..BBBB...',
    '...BBBB..BBBB...',
  ],
  down_step: [
    '................',
    '................',
    '.....OOOOOO.....',
    '...OOSSSSSSOO...',
    '..OSSSSSSSSSSO..',
    '.OSSSSSSSSSSSSO.',
    '.OSSSSSSSSSSSSO.',
    'OSSSWESSSSWESSSO',
    'OSSSEESSSSEESSSO',
    'OSSSEESSSSEESSSO',
    '.OSbSSSSSSSSbSO.',
    '.OSSSSSmmSSSSSO.',
    '..OSSSSSSSSSSO..',
    '...OOSSSSSSOO...',
    '..OOTTTTTTTTOO..',
    '.OTTTTTTTTTTTTO.',
    '.OTtTTTTTTTTtTO.',
    '.OSTTTTTTTTTTSO.',
    '..OTTTTTTTTTTO..',
    '.........PPP....',
    '....PPP..PPP....',
    '...BBBB..PPP....',
    '...BBBB.BBBB....',
    '.........BBBB...',
  ],
  up_idle: [
    '................',
    '................',
    '.....OOOOOO.....',
    '...OOSSSSSSOO...',
    '..OSSSSSSSSSSO..',
    '.OSSSSSSSSSSSSO.',
    '.OSSSSSSSSSSSSO.',
    'OSSSSSSSSSSSSSSO',
    'OSSSSSSSSSSSSSSO',
    'OSSSSSSSSSSSSSSO',
    '.OSSSSSSSSSSSSO.',
    '.OSSSSSSSSSSSSO.',
    '..OSSSSSSSSSSO..',
    '...OOSSSSSSOO...',
    '..OOTTTTTTTTOO..',
    '.OTTTTTTTTTTTTO.',
    '.OTtTTTTTTTTtTO.',
    '.OSTTTTTTTTTTSO.',
    '..OTTTTTTTTTTO..',
    '....PPP..PPP....',
    '....PPP..PPP....',
    '....PPP..PPP....',
    '...BBBB..BBBB...',
    '...BBBB..BBBB...',
  ],
  up_step: [
    '................',
    '................',
    '.....OOOOOO.....',
    '...OOSSSSSSOO...',
    '..OSSSSSSSSSSO..',
    '.OSSSSSSSSSSSSO.',
    '.OSSSSSSSSSSSSO.',
    'OSSSSSSSSSSSSSSO',
    'OSSSSSSSSSSSSSSO',
    'OSSSSSSSSSSSSSSO',
    '.OSSSSSSSSSSSSO.',
    '.OSSSSSSSSSSSSO.',
    '..OSSSSSSSSSSO..',
    '...OOSSSSSSOO...',
    '..OOTTTTTTTTOO..',
    '.OTTTTTTTTTTTTO.',
    '.OTtTTTTTTTTtTO.',
    '.OSTTTTTTTTTTSO.',
    '..OTTTTTTTTTTO..',
    '.........PPP....',
    '....PPP..PPP....',
    '...BBBB..PPP....',
    '...BBBB.BBBB....',
    '.........BBBB...',
  ],
  right_idle: [
    '................',
    '................',
    '.....OOOOOO.....',
    '...OOSSSSSSOO...',
    '..OSSSSSSSSSSO..',
    '.OSSSSSSSSSSSSO.',
    '.OSSSSSSSSSSSSO.',
    '.OSSSSSSSSWESSO.',
    '.OSSSSSSSSEESSO.',
    '.OSSSSSSSSEESSO.',
    '.OSSSSSSSSSSbSO.',
    '.OSSSSSSSSSmmSO.',
    '..OSSSSSSSSSSO..',
    '...OOSSSSSSOO...',
    '...OTTTTTTTTO...',
    '..OTTTTTTTTTTO..',
    '..OTTTtTTtTTTO..',
    '..OTTTtTTtTTTO..',
    '...OTTtSStTTO...',
    '.....PPPPP......',
    '.....PPPPP......',
    '.....PPPPP......',
    '....BBBBBB......',
    '....BBBBBB......',
  ],
  right_stepA: [
    '................',
    '................',
    '.....OOOOOO.....',
    '...OOSSSSSSOO...',
    '..OSSSSSSSSSSO..',
    '.OSSSSSSSSSSSSO.',
    '.OSSSSSSSSSSSSO.',
    '.OSSSSSSSSWESSO.',
    '.OSSSSSSSSEESSO.',
    '.OSSSSSSSSEESSO.',
    '.OSSSSSSSSSSbSO.',
    '.OSSSSSSSSSmmSO.',
    '..OSSSSSSSSSSO..',
    '...OOSSSSSSOO...',
    '...OTTTTTTTTO...',
    '..OTTTTTTTTTTO..',
    '..OTTTtTTtTTTO..',
    '..OTTTtTTtTTTO..',
    '...OTTtSStTTO...',
    '...PPP...PPP....',
    '..PPP.....PPP...',
    '..PPP.....PPP...',
    '.BBBB....BBBB...',
    '.BBBB....BBBB...',
  ],
  right_stepB: [
    '................',
    '................',
    '.....OOOOOO.....',
    '...OOSSSSSSOO...',
    '..OSSSSSSSSSSO..',
    '.OSSSSSSSSSSSSO.',
    '.OSSSSSSSSSSSSO.',
    '.OSSSSSSSSWESSO.',
    '.OSSSSSSSSEESSO.',
    '.OSSSSSSSSEESSO.',
    '.OSSSSSSSSSSbSO.',
    '.OSSSSSSSSSmmSO.',
    '..OSSSSSSSSSSO..',
    '...OOSSSSSSOO...',
    '...OTTTTTTTTO...',
    '..OTTTTTTTTTTO..',
    '..OTTTtTTtTTTO..',
    '..OTTTtTTtTTTO..',
    '...OTTtSStTTO...',
    '......PPPP......',
    '.....PPPPPP.....',
    '.....PP..PP.....',
    '....BBB..BBB....',
    '....BBB..BBB....',
  ],
};

// ---------------------------------------------------------------------------
// COIFFURES — calques 16×24 posés sur la tête.
// Légende : H cheveux, h ombre cheveux, C casquette, c visière/ombre casquette.
// Vues : down (face), up (dos), right (profil) ; gauche = miroir de right.
// ---------------------------------------------------------------------------
const HAIR = {
  short: {
    down: [
      '................',
      '................',
      '.....HHHHHH.....',
      '...HHHHHHHHHH...',
      '..HHHHHHHHHHHH..',
      '.HHHHHHHHHHHHHH.',
      '.HHhHHHHHHHHhHH.',
      '.HH..HHHHHH..HH.',
      '.HH...H..H...HH.',
    ],
    up: [
      '................',
      '................',
      '.....HHHHHH.....',
      '...HHHHHHHHHH...',
      '..HHHHHHHHHHHH..',
      '.HHHHHHHHHHHHHH.',
      '.HHHHHHHHHHHHHH.',
      'HHHHHHHHHHHHHHHH',
      'HHHHHHHHHHHHHHHH',
      'HHHhHHHHHHHHhHHH',
      '.HHHHHHHHHHHHHH.',
      '.HhHHHHHHHHHHhH.',
      '..HHHHHHHHHHHH..',
      '...HH......HH...',
    ],
    right: [
      '................',
      '................',
      '.....HHHHHH.....',
      '...HHHHHHHHHH...',
      '..HHHHHHHHHHHH..',
      '.HHHHHHHHHHHHH..',
      '.HHHHHHHHHhHHH..',
      '.HHHHHHHH..HH...',
      '.HHhHHH.........',
      '.HHHHH..........',
      '..HHH...........',
    ],
  },
  cap: {
    down: [
      '................',
      '................',
      '.....CCCCCC.....',
      '...CCCCCCCCCC...',
      '..CCCCCCCCCCCC..',
      '.CCCCCCCCCCCCCC.',
      'cccccccccccccccc',
      '.HH..........HH.',
    ],
    up: [
      '................',
      '................',
      '.....CCCCCC.....',
      '...CCCCCCCCCC...',
      '..CCCCCCCCCCCC..',
      '.CCCCCCCCCCCCCC.',
      '.CCCCCCccCCCCCC.',
      '.HHCCCCCCCCCCHH.',
      '.HH..........HH.',
    ],
    right: [
      '................',
      '................',
      '.....CCCCCC.....',
      '...CCCCCCCCCC...',
      '..CCCCCCCCCCCC..',
      '.CCCCCCCCCCCCCC.',
      '....cccccccccccc',
      '.HHH............',
      '.HH.............',
    ],
  },
  long: {
    down: [
      '................',
      '................',
      '.....HHHHHH.....',
      '...HHHHHHHHHH...',
      '..HHHHHHHHHHHH..',
      '.HHHHHHHHHHHHHH.',
      '.HHhHHHHHHHHhHH.',
      'HHH..HHHHHH..HHH',
      'HHH...H..H...HHH',
      'HHH..........HHH',
      'HHH..........HHH',
      'HHh..........hHH',
      'HHH..........HHH',
      'HHH..........HHH',
      '.HH..........HH.',
      '.hH..........Hh.',
    ],
    up: [
      '................',
      '................',
      '.....HHHHHH.....',
      '...HHHHHHHHHH...',
      '..HHHHHHHHHHHH..',
      '.HHHHHHHHHHHHHH.',
      '.HHHHHHHHHHHHHH.',
      'HHHHHHHHHHHHHHHH',
      'HHHHHHHHHHHHHHHH',
      'HHHHhHHHHHHhHHHH',
      'HHHHHHHHHHHHHHHH',
      '.HHHHHHHHHHHHHH.',
      '.HHHHhHHHHhHHHH.',
      '.HHHHHHHHHHHHHH.',
      '..HHHHHHHHHHHH..',
      '...HHHHHHHHHH...',
    ],
    right: [
      '................',
      '................',
      '.....HHHHHH.....',
      '...HHHHHHHHHH...',
      '..HHHHHHHHHHHH..',
      '.HHHHHHHHHHHHH..',
      '.HHHHHHHHHhHHH..',
      '.HHHHHHHH..HH...',
      '.HHHHHHH........',
      '.HHHHHH.........',
      '.HHHHHh.........',
      '.HHHHH..........',
      '.HHHHH..........',
      '.HHHHh..........',
      '..HHH...........',
      '..hHH...........',
    ],
  },
  bun: {
    down: [
      '......HHHH......',
      '.....HHhHHH.....',
      '.....HHHHHH.....',
      '...HHHHHHHHHH...',
      '..HHHHHHHHHHHH..',
      '.HHHHHHHHHHHHHH.',
      '.HHhHHHHHHHHhHH.',
      '.HH..........HH.',
    ],
    up: [
      '................',
      '................',
      '.....HHHHHH.....',
      '...HHHHHHHHHH...',
      '..HHHHHHHHHHHH..',
      '.HHHHHHHHHHHHHH.',
      '.HHHHHHHHHHHHHH.',
      'HHHHHHHHHHHHHHHH',
      'HHHHHHhHHhHHHHHH',
      'HHHHHhHHHHhHHHHH',
      '.HHHHHhHHhHHHHH.',
      '.HHHHHHHHHHHHHH.',
      '...HHHHHHHHHH...',
      '................',
    ],
    right: [
      '.....HHHH.......',
      '....HHhHHH......',
      '....HHHHHH......',
      '...HHHHHHHHHH...',
      '..HHHHHHHHHHHH..',
      '.HHHHHHHHHHHHH..',
      '.HHHHHHHHHhHHH..',
      '.HHH............',
    ],
  },
  grayfringe: {
    down: [
      '................',
      '................',
      '................',
      '................',
      '................',
      '................',
      '.HH..........HH.',
      '.HH..........HH.',
      '.Hh..........hH.',
    ],
    up: [
      '................',
      '................',
      '................',
      '................',
      '................',
      '.HH..........HH.',
      '.HHH........HHH.',
      'HHHHHHHHHHHHHHHH',
      'HHHhHHHHHHHHhHHH',
      '.HHHHHHHHHHHHHH.',
      '..HH........HH..',
    ],
    right: [
      '................',
      '................',
      '................',
      '................',
      '................',
      '.HHH............',
      '.HHHH...........',
      '.HHH............',
      '.HHh............',
    ],
  },
  bald: { down: [], up: [], right: [] },
};

// ---------------------------------------------------------------------------
// ACCESSOIRES — G lunettes, D barbe, N moustache.
// ---------------------------------------------------------------------------
const GLASSES = {
  down: [
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '..GGGGG..GGGGG..',
    '..G...GGGG...G..',
    '..GGGGG..GGGGG..',
  ],
  right: [
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '........GGGGG...',
    '........G...G...',
    '........GGGGG...',
  ],
};
const BEARD = {
  down: [
    '................', '................', '................', '................',
    '................', '................', '................', '................',
    '................', '................',
    '.DD..........DD.',
    '.DDD........DDD.',
    '..DDDDDDDDDDDD..',
    '...DDDDDDDDDD...',
    '.....DDDDDD.....',
  ],
  right: [
    '................', '................', '................', '................',
    '................', '................', '................', '................',
    '................', '................',
    '..DD............',
    '..DDD.......DDD.',
    '...DDDDDDDDDDD..',
    '....DDDDDDDDD...',
    '......DDDDD.....',
  ],
};
const MUSTACHE = {
  down: [
    '................', '................', '................', '................',
    '................', '................', '................', '................',
    '................', '................',
    '.....NN..NN.....',
    '....NNN..NNN....',
  ],
  right: [
    '................', '................', '................', '................',
    '................', '................', '................', '................',
    '................', '................',
    '..........NNN...',
    '.........NNN....',
  ],
};

// ---------------------------------------------------------------------------
// Rendu
// ---------------------------------------------------------------------------
function paletteFor(cfg) {
  const skin = cfg.skin;
  const hair = cfg.hairStyle === 'bald' ? cfg.skin : cfg.hair;
  const shirt = cfg.shirt;
  const cap = cfg.capColor || '#d84f42';
  return {
    O: 'rgba(62,40,32,.9)',
    S: skin,
    s: tone(skin, -0.18),
    W: '#ffffff',
    E: '#33261f',
    m: '#a05038',
    b: cfg.blush ? 'rgba(244,130,120,.55)' : 'rgba(0,0,0,0)',
    T: shirt,
    t: tone(shirt, -0.25),
    P: tone(shirt, -0.45),
    B: '#6b4a32',
    H: hair,
    h: tone(hair, -0.25),
    C: cap,
    c: tone(cap, -0.3),
    G: '#2a2e38',
    D: cfg.beard || '#888',
    N: cfg.mustache || '#555',
  };
}

function mirrorGrid(grid) {
  return grid.map((row) => row.split('').reverse().join(''));
}

/** Peint une grille sur un contexte à l'échelle donnée. */
function paintGrid(ctx, grid, pal, scale) {
  for (let y = 0; y < grid.length; y++) {
    const row = grid[y];
    for (let x = 0; x < row.length; x++) {
      const ch = row[x];
      if (ch === '.' || ch === ' ') continue;
      const col = pal[ch];
      if (!col) continue;
      ctx.fillStyle = col;
      ctx.fillRect(x * scale, y * scale, scale, scale);
    }
  }
}

/** Compose les calques d'une frame et renvoie un canvas hors écran. */
function buildFrame(cfg, dir, frame, scale) {
  const canvas = document.createElement('canvas');
  canvas.width = SW * scale;
  canvas.height = SH * scale;
  const ctx = canvas.getContext('2d');
  const pal = paletteFor(cfg);

  const view = dir === 'left' ? 'right' : dir;       // gauche = miroir de droite
  const mirror = dir === 'left';
  const bodyKey = (view === 'right')
    ? (frame === 0 ? 'right_idle' : frame === 1 ? 'right_stepA' : 'right_stepB')
    : `${view}_${frame === 0 ? 'idle' : 'step'}`;
  let body = BODY[bodyKey];
  // down/up : la 2e frame de pas est le miroir de la 1re
  if (view !== 'right' && frame === 2) body = mirrorGrid(BODY[`${view}_step`]);
  if (mirror) body = mirrorGrid(body);
  paintGrid(ctx, body, pal, scale);

  const style = HAIR[cfg.hairStyle] || HAIR.short;
  let hairGrid = style[view === 'right' ? 'right' : view] || [];
  if (mirror) hairGrid = mirrorGrid(hairGrid);
  paintGrid(ctx, hairGrid, pal, scale);

  if (view !== 'up') {
    const face = view === 'right' ? 'right' : 'down';
    if (cfg.glasses) paintGrid(ctx, mirror ? mirrorGrid(GLASSES[face]) : GLASSES[face], pal, scale);
    if (cfg.beard) paintGrid(ctx, mirror ? mirrorGrid(BEARD[face]) : BEARD[face], pal, scale);
    if (cfg.mustache) paintGrid(ctx, mirror ? mirrorGrid(MUSTACHE[face]) : MUSTACHE[face], pal, scale);
  }
  return canvas;
}

const cache = new Map();

function frameFor(cfg, dir, frame, scale) {
  const key = `${cfg.skin}|${cfg.hair}|${cfg.hairStyle}|${cfg.shirt}|${cfg.capColor}|${cfg.glasses}|${cfg.beard}|${cfg.mustache}|${cfg.blush}|${dir}|${frame}|${scale}`;
  let c = cache.get(key);
  if (!c) {
    c = buildFrame(cfg, dir, frame, scale);
    cache.set(key, c);
  }
  return c;
}

/**
 * Dessine le sprite pixel art d'un personnage.
 * (x, y) = centre des pieds ; s = taille de tuile ; step = phase 0..1.
 */
export function drawCharacterSprite(ctx, cfg, x, y, s, dir = 'down', step = 0) {
  const walking = step > 0;
  // Cycle de marche en 4 temps : pas A, neutre, pas B, neutre
  const beat = walking ? Math.floor(step * 4) % 4 : 3;
  const frame = beat === 0 ? 1 : beat === 2 ? 2 : 0;
  const scale = Math.max(2, Math.round((s * 1.35) / SH));

  // Ombre au sol
  ctx.fillStyle = 'rgba(20,60,20,.28)';
  ctx.beginPath();
  ctx.ellipse(x, y + s * 0.02, s * 0.24, s * 0.08, 0, 0, Math.PI * 2);
  ctx.fill();

  const img = frameFor(cfg, dir, frame, scale);
  const prev = ctx.imageSmoothingEnabled;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(img, Math.round(x - img.width / 2), Math.round(y - img.height + scale));
  ctx.imageSmoothingEnabled = prev;
}
