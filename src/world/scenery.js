/**
 * Décor VECTORIEL doux, façon Animal Crossing moderne : terrain, nature,
 * mobilier et maisons dessinés au canvas avec dégradés, coins arrondis et
 * contours tendres — dans le même esprit que les personnages chibi
 * (drawCharacter). Aucun fichier image, aucun pixel « dur ».
 *
 * Remplace l'ancien rendu pixel art (pixeltiles.js) :
 *  - drawTile(ctx, name, x, y, s, variant, edges)  → sol
 *  - drawTree / drawRock                            → nature (ancrage bas-centre)
 *  - drawHouse                                      → maison
 *  - drawProp                                       → mobilier (dispatch par type)
 */

export const PAL = {
  // Terrain
  grass1: '#8ecb63', grass2: '#7bbd54', grassDk1: '#79b653', grassDk2: '#69a646',
  blade: '#a6da7e', bladeDk: '#5f9a41',
  path1: '#ecd9a6', path2: '#e0c98d', pathEdge: '#cbb173',
  sand1: '#f3e4b4', sand2: '#e8d497', sandEdge: '#d8c07f',
  water1: '#6fc3ec', water2: '#4ba7de', waterDk: '#3a8fc8', foam: 'rgba(255,255,255,.65)',
  floor1: '#e2b978', floor2: '#cf9f5f', floorLine: 'rgba(120,80,40,.28)',
  carpet1: '#c56a52', carpet2: '#ab5138', carpetEdge: '#e0a08d',
  wall1: '#9c8570', wall2: '#846d59', wallTop: '#b39c86',
  voidc: '#0c0f14',
  // Nature / matières
  trunk1: '#a9713f', trunk2: '#89572e',
  leaf1: '#8fd06a', leaf2: '#63b04c', leaf3: '#4f9a41', leafHi: '#b6e690',
  stone1: '#c4cad2', stone2: '#a6adb6', stone3: '#868d97',
  wood1: '#c08a4e', wood2: '#a06f39', wood3: '#7f5528',
  gold: '#f4cb54', goldDk: '#cf9f2e',
  white: '#f7f4ea', slate: '#3a5147', chalk: '#eae6da',
  outline: 'rgba(60,40,25,.35)',
};

function rr(ctx, x, y, w, h, r) {
  const rad = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.arcTo(x + w, y, x + w, y + h, rad);
  ctx.arcTo(x + w, y + h, x, y + h, rad);
  ctx.arcTo(x, y + h, x, y, rad);
  ctx.arcTo(x, y, x + w, y, rad);
  ctx.closePath();
}

function vgrad(ctx, x, y, h, c1, c2) {
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, c1);
  g.addColorStop(1, c2);
  return g;
}

// Petit générateur déterministe (pour poser accents/herbe sans scintillement).
function rng(seed) {
  let s = (seed * 2654435761) >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32);
}

// ---------------------------------------------------------------- terrain
function grassTile(ctx, x, y, s, v, dark) {
  // Aplat (sans dégradé par tuile) pour éviter tout effet de bandes.
  ctx.fillStyle = dark ? PAL.grassDk1 : PAL.grass1;
  ctx.fillRect(x, y, s + 0.6, s + 0.6);
  // touffes d'herbe douces
  const rnd = rng((Math.round(x / s) * 73856093) ^ (Math.round(y / s) * 19349663) ^ (v + 1));
  const n = 3;
  ctx.strokeStyle = dark ? PAL.bladeDk : PAL.blade;
  ctx.lineWidth = Math.max(1, s * 0.03);
  ctx.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const bx = x + (0.15 + rnd() * 0.7) * s;
    const by = y + (0.25 + rnd() * 0.65) * s;
    const hgt = s * (0.08 + rnd() * 0.06);
    const lean = (rnd() - 0.5) * s * 0.05;
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.quadraticCurveTo(bx + lean, by - hgt * 0.7, bx + lean * 1.6, by - hgt);
    ctx.moveTo(bx + s * 0.05, by);
    ctx.quadraticCurveTo(bx + s * 0.05 + lean, by - hgt * 0.55, bx + s * 0.05 + lean, by - hgt * 0.8);
    ctx.stroke();
  }
}

// Sol « dur » (chemin/sable) avec coins arrondis là où il borde l'herbe.
function groundTile(ctx, x, y, s, c1, c2, edgeC, edges) {
  const e = edges || {};
  ctx.save();
  // Découpe : on arrondit chaque coin dont les DEUX côtés bordent l'herbe.
  const rad = s * 0.42;
  const nw = e.n && e.w, ne = e.n && e.e, se = e.s && e.e, sw = e.s && e.w;
  ctx.beginPath();
  ctx.moveTo(x + (nw ? rad : 0), y);
  ctx.lineTo(x + s - (ne ? rad : 0), y);
  if (ne) ctx.arcTo(x + s, y, x + s, y + rad, rad); else ctx.lineTo(x + s, y);
  ctx.lineTo(x + s, y + s - (se ? rad : 0));
  if (se) ctx.arcTo(x + s, y + s, x + s - rad, y + s, rad); else ctx.lineTo(x + s, y + s);
  ctx.lineTo(x + (sw ? rad : 0), y + s);
  if (sw) ctx.arcTo(x, y + s, x, y + s - rad, rad); else ctx.lineTo(x, y + s);
  ctx.lineTo(x, y + (nw ? rad : 0));
  if (nw) ctx.arcTo(x, y, x + rad, y, rad); else ctx.lineTo(x, y);
  ctx.closePath();
  ctx.clip();
  ctx.fillStyle = c1;
  ctx.fillRect(x - 1, y - 1, s + 2, s + 2);
  void c2;
  // liseré doux sur les bords qui touchent l'herbe
  ctx.strokeStyle = edgeC;
  ctx.lineWidth = s * 0.06;
  ctx.globalAlpha = 0.5;
  if (e.n) { ctx.beginPath(); ctx.moveTo(x - 1, y + 1); ctx.lineTo(x + s + 1, y + 1); ctx.stroke(); }
  if (e.s) { ctx.beginPath(); ctx.moveTo(x - 1, y + s - 1); ctx.lineTo(x + s + 1, y + s - 1); ctx.stroke(); }
  if (e.w) { ctx.beginPath(); ctx.moveTo(x + 1, y - 1); ctx.lineTo(x + 1, y + s + 1); ctx.stroke(); }
  if (e.e) { ctx.beginPath(); ctx.moveTo(x + s - 1, y - 1); ctx.lineTo(x + s - 1, y + s + 1); ctx.stroke(); }
  ctx.restore();
}

function waterTile(ctx, x, y, s, frame, edges) {
  ctx.fillStyle = PAL.water2;
  ctx.fillRect(x, y, s + 0.6, s + 0.6);
  // reflets ondulants
  ctx.strokeStyle = 'rgba(255,255,255,.35)';
  ctx.lineWidth = Math.max(1, s * 0.035);
  ctx.lineCap = 'round';
  const off = frame ? s * 0.18 : 0;
  for (const [ry, rw] of [[0.32, 0.4], [0.6, 0.28], [0.82, 0.34]]) {
    ctx.beginPath();
    ctx.moveTo(x + s * 0.12 + off, y + s * ry);
    ctx.quadraticCurveTo(x + s * (0.12 + rw / 2) + off, y + s * ry - s * 0.05,
      x + s * (0.12 + rw) + off, y + s * ry);
    ctx.stroke();
  }
  // écume sur les rives (côtés bordant autre chose que de l'eau)
  const e = edges || {};
  ctx.fillStyle = PAL.foam;
  const band = s * 0.16;
  if (e.n) ctx.fillRect(x, y, s, band);
  if (e.s) ctx.fillRect(x, y + s - band, s, band);
  if (e.w) ctx.fillRect(x, y, band, s);
  if (e.e) ctx.fillRect(x + s - band, y, band, s);
}

function floorTile(ctx, x, y, s, v) {
  ctx.fillStyle = PAL.floor1;
  ctx.fillRect(x, y, s + 0.6, s + 0.6);
  ctx.strokeStyle = PAL.floorLine;
  ctx.lineWidth = Math.max(1, s * 0.02);
  ctx.beginPath();
  ctx.moveTo(x, y + s * 0.5); ctx.lineTo(x + s, y + s * 0.5);
  const seam = v % 2 ? x + s * 0.5 : x + s * 0.25;
  ctx.moveTo(seam, y); ctx.lineTo(seam, y + s * 0.5);
  const seam2 = v % 2 ? x + s * 0.25 : x + s * 0.72;
  ctx.moveTo(seam2, y + s * 0.5); ctx.lineTo(seam2, y + s);
  ctx.stroke();
}

function carpetTile(ctx, x, y, s) {
  // Aplat uni : un grand tapis doux, sans grille de tuiles.
  ctx.fillStyle = PAL.carpet1;
  ctx.fillRect(x, y, s + 0.6, s + 0.6);
}

function wallTile(ctx, x, y, s) {
  ctx.fillStyle = PAL.wall1;
  ctx.fillRect(x, y, s + 0.6, s + 0.6);
  ctx.fillStyle = 'rgba(255,255,255,.12)';
  ctx.fillRect(x, y, s, s * 0.18);
  ctx.fillStyle = 'rgba(0,0,0,.14)';
  ctx.fillRect(x, y + s * 0.82, s, s * 0.18);
}

function flowerOverlay(ctx, x, y, s, v) {
  const cols = [['#f47ea6', '#f9a7c2'], ['#f6d24a', '#fbe58c'], ['#f0f0f0', '#ffffff'], ['#b98ce0', '#d4b6f0']];
  const rnd = rng((Math.round(x / s) * 12345) ^ (Math.round(y / s) * 6789) ^ (v + 1));
  const n = 2 + (v % 2);
  for (let i = 0; i < n; i++) {
    const fx = x + (0.2 + rnd() * 0.6) * s;
    const fy = y + (0.25 + rnd() * 0.55) * s;
    const r = s * 0.06;
    const [pc, pl] = cols[Math.floor(rnd() * cols.length)];
    // tige
    ctx.strokeStyle = PAL.leaf3;
    ctx.lineWidth = Math.max(1, s * 0.02);
    ctx.beginPath(); ctx.moveTo(fx, fy + r); ctx.lineTo(fx, fy + r * 2.4); ctx.stroke();
    // pétales
    ctx.fillStyle = pc;
    for (let a = 0; a < 5; a++) {
      const ang = (a / 5) * Math.PI * 2;
      ctx.beginPath();
      ctx.ellipse(fx + Math.cos(ang) * r, fy + Math.sin(ang) * r, r * 0.72, r * 0.72, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = pl;
    ctx.beginPath(); ctx.arc(fx - r * 0.2, fy - r * 0.2, r * 0.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = PAL.gold;
    ctx.beginPath(); ctx.arc(fx, fy, r * 0.5, 0, Math.PI * 2); ctx.fill();
  }
}

/** Dessine une tuile de sol. edges = {n,e,s,w} : côtés bordant un autre terrain. */
export function drawTile(ctx, name, x, y, s, variant = 0, edges = null) {
  switch (name) {
    case 'grass': grassTile(ctx, x, y, s, variant, false); break;
    case 'grassdark': grassTile(ctx, x, y, s, variant, true); break;
    case 'path': groundTile(ctx, x, y, s, PAL.path1, PAL.path2, PAL.pathEdge, edges); break;
    case 'sand': groundTile(ctx, x, y, s, PAL.sand1, PAL.sand2, PAL.sandEdge, edges); break;
    case 'water': waterTile(ctx, x, y, s, variant, edges); break;
    case 'floor': floorTile(ctx, x, y, s, variant); break;
    case 'carpet': carpetTile(ctx, x, y, s); break;
    case 'wall': wallTile(ctx, x, y, s); break;
    case 'flower': flowerOverlay(ctx, x, y, s, variant); break;
    default: ctx.fillStyle = PAL.voidc; ctx.fillRect(x, y, s + 0.6, s + 0.6);
  }
}

// ------------------------------------------------------------ ombre au sol
function shadow(ctx, cx, cy, rx, ry) {
  ctx.fillStyle = 'rgba(30,60,25,.22)';
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

// ------------------------------------------------------------------ nature
/** Arbre rond façon AC. (x,y) = bas-centre. */
export function drawTree(ctx, x, y, s) {
  shadow(ctx, x, y - s * 0.04, s * 0.34, s * 0.12);
  // tronc
  ctx.fillStyle = vgrad(ctx, x, y - s * 0.7, s * 0.7, PAL.trunk1, PAL.trunk2);
  rr(ctx, x - s * 0.09, y - s * 0.62, s * 0.18, s * 0.6, s * 0.06);
  ctx.fill();
  // feuillage en bouquet de disques
  const cy = y - s * 0.95;
  const blobs = [
    [0, s * 0.18, s * 0.42, PAL.leaf3],
    [-s * 0.3, s * 0.05, s * 0.3, PAL.leaf2],
    [s * 0.3, s * 0.05, s * 0.3, PAL.leaf2],
    [0, -s * 0.18, s * 0.36, PAL.leaf1],
  ];
  ctx.strokeStyle = 'rgba(40,90,40,.25)';
  ctx.lineWidth = Math.max(1, s * 0.02);
  for (const [dx, dy, r, col] of blobs) {
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.arc(x + dx, cy + dy, r, 0, Math.PI * 2);
    ctx.fill();
  }
  // reflet
  ctx.fillStyle = PAL.leafHi;
  ctx.beginPath();
  ctx.arc(x - s * 0.12, cy - s * 0.18, s * 0.12, 0, Math.PI * 2);
  ctx.fill();
}

/** Rocher arrondi. (x,y) = bas-centre. */
export function drawRock(ctx, x, y, s) {
  shadow(ctx, x, y, s * 0.28, s * 0.09);
  ctx.fillStyle = vgrad(ctx, x, y - s * 0.4, s * 0.4, PAL.stone1, PAL.stone3);
  ctx.beginPath();
  ctx.moveTo(x - s * 0.28, y);
  ctx.quadraticCurveTo(x - s * 0.34, y - s * 0.34, x - s * 0.05, y - s * 0.36);
  ctx.quadraticCurveTo(x + s * 0.34, y - s * 0.38, x + s * 0.3, y);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.35)';
  ctx.beginPath();
  ctx.ellipse(x - s * 0.08, y - s * 0.24, s * 0.1, s * 0.05, -0.4, 0, Math.PI * 2);
  ctx.fill();
}

// ------------------------------------------------------------------ maison
function shade(hex, f) {
  const n = parseInt(hex.slice(1), 16);
  const ch = (v) => Math.max(0, Math.min(255, Math.round(f < 0 ? v * (1 + f) : v + (255 - v) * f)));
  return `rgb(${ch((n >> 16) & 255)},${ch((n >> 8) & 255)},${ch(n & 255)})`;
}

/**
 * Maison douce et arrondie. (x,y) = coin haut-gauche de l'emprise (px écran),
 * wT/hT en tuiles, size = taille de tuile. Le toit déborde au-dessus.
 */
export function drawHouse(ctx, x, y, wT, hT, palette, doorCol, size) {
  const w = wT * size;
  const bodyTop = y + size * 0.9;             // le toit occupe ~0.9 tuile au-dessus
  const bodyH = y + hT * size - bodyTop;
  const body = palette.body;
  const roof = palette.roof;

  shadow(ctx, x + w / 2, y + hT * size, w * 0.5, size * 0.14);

  // corps
  ctx.fillStyle = vgrad(ctx, x, bodyTop, bodyH, shade(body, 0.08), shade(body, -0.12));
  rr(ctx, x, bodyTop, w, bodyH, size * 0.14);
  ctx.fill();

  // toit arrondi (trapèze à sommet mou) qui déborde
  const roofOver = size * 0.28;
  const ridgeY = y + size * 0.06;
  const eaveY = bodyTop + size * 0.04;
  ctx.fillStyle = vgrad(ctx, x, ridgeY, eaveY - ridgeY, shade(roof, 0.12), shade(roof, -0.14));
  ctx.beginPath();
  ctx.moveTo(x - roofOver, eaveY);
  ctx.quadraticCurveTo(x - roofOver, eaveY - size * 0.1, x + w * 0.16, ridgeY + size * 0.06);
  ctx.quadraticCurveTo(x + w / 2, ridgeY - size * 0.06, x + w * 0.84, ridgeY + size * 0.06);
  ctx.quadraticCurveTo(x + w + roofOver, eaveY - size * 0.1, x + w + roofOver, eaveY);
  ctx.closePath();
  ctx.fill();
  // liseré de toit
  ctx.fillStyle = shade(roof, -0.22);
  ctx.fillRect(x - roofOver, eaveY - size * 0.06, w + roofOver * 2, size * 0.07);

  // porte en arche
  const dw = size * 0.62;
  const dh = bodyH * 0.62;
  const dx = x + (doorCol + 0.5) * size - dw / 2;
  const dy = y + hT * size - dh;
  ctx.fillStyle = PAL.wood3;
  ctx.beginPath();
  ctx.moveTo(dx, dy + dh);
  ctx.lineTo(dx, dy + dw * 0.5);
  ctx.arc(dx + dw / 2, dy + dw * 0.5, dw / 2, Math.PI, 0);
  ctx.lineTo(dx + dw, dy + dh);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = PAL.wood1;
  ctx.beginPath();
  ctx.moveTo(dx + dw * 0.16, dy + dh);
  ctx.lineTo(dx + dw * 0.16, dy + dw * 0.5);
  ctx.arc(dx + dw / 2, dy + dw * 0.5, dw * 0.34, Math.PI, 0);
  ctx.lineTo(dx + dw * 0.84, dy + dh);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = PAL.gold;
  ctx.beginPath();
  ctx.arc(dx + dw * 0.74, dy + dh * 0.6, size * 0.045, 0, Math.PI * 2);
  ctx.fill();

  // fenêtres rondes sur les autres colonnes
  for (let i = 0; i < wT; i++) {
    if (i === doorCol) continue;
    const wx = x + (i + 0.5) * size;
    const wy = bodyTop + bodyH * 0.42;
    const wr = size * 0.24;
    ctx.fillStyle = PAL.white;
    ctx.beginPath(); ctx.arc(wx, wy, wr, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#bfe4f2';
    ctx.beginPath(); ctx.arc(wx, wy, wr * 0.76, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.6)';
    ctx.beginPath(); ctx.arc(wx - wr * 0.22, wy - wr * 0.22, wr * 0.28, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = PAL.white; ctx.lineWidth = Math.max(1, size * 0.04);
    ctx.beginPath();
    ctx.moveTo(wx - wr * 0.76, wy); ctx.lineTo(wx + wr * 0.76, wy);
    ctx.moveTo(wx, wy - wr * 0.76); ctx.lineTo(wx, wy + wr * 0.76);
    ctx.stroke();
  }
}

// ------------------------------------------------------------------ mobilier
/**
 * Dessine un meuble/objet vectoriel dans son emprise. (x,y) = coin haut-gauche
 * de l'emprise (px écran), wT/hT en tuiles, s = taille de tuile.
 */
export function drawProp(ctx, type, x, y, wT, hT, s, frame = 0) {
  const w = wT * s;
  const h = hT * s;
  const cx = x + w / 2;
  const bottom = y + h;
  switch (type) {
    case 'fountain': {
      shadow(ctx, cx, bottom - s * 0.1, w * 0.46, s * 0.16);
      ctx.fillStyle = vgrad(ctx, x, y, h, PAL.stone1, PAL.stone3);
      ctx.beginPath(); ctx.ellipse(cx, bottom - h * 0.28, w * 0.46, h * 0.3, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = PAL.waterDk;
      ctx.beginPath(); ctx.ellipse(cx, bottom - h * 0.3, w * 0.36, h * 0.22, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = PAL.water1;
      ctx.beginPath(); ctx.ellipse(cx, bottom - h * 0.32, w * 0.3, h * 0.17, 0, 0, Math.PI * 2); ctx.fill();
      // vasque + jet
      ctx.fillStyle = PAL.stone2;
      rr(ctx, cx - w * 0.06, bottom - h * 0.62, w * 0.12, h * 0.34, s * 0.05); ctx.fill();
      ctx.fillStyle = PAL.foam;
      ctx.beginPath(); ctx.arc(cx, bottom - h * 0.66, w * 0.09, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 0.8;
      const spread = frame ? w * 0.18 : w * 0.14;
      ctx.beginPath(); ctx.arc(cx - spread, bottom - h * 0.5, s * 0.04, 0, Math.PI * 2);
      ctx.arc(cx + spread, bottom - h * 0.46, s * 0.04, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
      break;
    }
    case 'sign': {
      shadow(ctx, cx, bottom, s * 0.24, s * 0.07);
      ctx.fillStyle = PAL.wood3;
      ctx.fillRect(cx - s * 0.05, bottom - h * 0.55, s * 0.1, h * 0.55);
      ctx.fillStyle = vgrad(ctx, x, y + h * 0.1, h * 0.45, PAL.wood1, PAL.wood2);
      rr(ctx, cx - w * 0.4, y + h * 0.1, w * 0.8, h * 0.45, s * 0.08); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = Math.max(1, s * 0.03);
      ctx.beginPath();
      ctx.moveTo(cx - w * 0.24, y + h * 0.24); ctx.lineTo(cx + w * 0.24, y + h * 0.24);
      ctx.moveTo(cx - w * 0.24, y + h * 0.36); ctx.lineTo(cx + w * 0.1, y + h * 0.36);
      ctx.stroke();
      break;
    }
    case 'bed': {
      shadow(ctx, cx, bottom - s * 0.06, w * 0.5, s * 0.12);
      ctx.fillStyle = vgrad(ctx, x, y, h, PAL.wood1, PAL.wood2);
      rr(ctx, x + s * 0.06, y + s * 0.04, w - s * 0.12, h - s * 0.08, s * 0.14); ctx.fill();
      ctx.fillStyle = '#d8695c';
      rr(ctx, x + s * 0.12, y + h * 0.32, w - s * 0.24, h * 0.6, s * 0.12); ctx.fill();
      ctx.fillStyle = PAL.white;
      rr(ctx, x + s * 0.16, y + h * 0.08, w - s * 0.32, h * 0.2, s * 0.1); ctx.fill();
      break;
    }
    case 'shelf': {
      shadow(ctx, cx, bottom, w * 0.5, s * 0.09);
      ctx.fillStyle = vgrad(ctx, x, y, h, PAL.wood2, PAL.wood3);
      rr(ctx, x, y + h * 0.06, w, h * 0.94, s * 0.1); ctx.fill();
      const cols = ['#d1685a', '#5a86b8', '#6faa62', '#d8b04c', '#9a6faa', '#e0956a'];
      const rows = 2, per = Math.max(3, Math.round(wT * 3));
      for (let rIdx = 0; rIdx < rows; rIdx++) {
        const by = y + h * (0.16 + rIdx * 0.42);
        for (let i = 0; i < per; i++) {
          const bw = (w - s * 0.3) / per;
          const bx = x + s * 0.15 + i * bw;
          ctx.fillStyle = cols[(i + rIdx * 2) % cols.length];
          rr(ctx, bx + bw * 0.14, by, bw * 0.72, h * 0.3, s * 0.03); ctx.fill();
        }
      }
      break;
    }
    case 'counter': {
      shadow(ctx, cx, bottom, w * 0.5, s * 0.09);
      ctx.fillStyle = vgrad(ctx, x, y + h * 0.3, h * 0.7, PAL.wood1, PAL.wood2);
      rr(ctx, x, y + h * 0.3, w, h * 0.7, s * 0.1); ctx.fill();
      ctx.fillStyle = shade(PAL.wood1, 0.16);
      rr(ctx, x - s * 0.04, y + h * 0.2, w + s * 0.08, h * 0.18, s * 0.06); ctx.fill();
      break;
    }
    case 'table': {
      shadow(ctx, cx, bottom, w * 0.44, s * 0.09);
      ctx.fillStyle = PAL.wood3;
      ctx.fillRect(x + s * 0.16, y + h * 0.5, s * 0.1, h * 0.5);
      ctx.fillRect(x + w - s * 0.26, y + h * 0.5, s * 0.1, h * 0.5);
      ctx.fillStyle = vgrad(ctx, x, y + h * 0.28, h * 0.32, shade(PAL.wood1, 0.14), PAL.wood1);
      rr(ctx, x + s * 0.05, y + h * 0.28, w - s * 0.1, h * 0.3, s * 0.09); ctx.fill();
      break;
    }
    case 'boardtable': {
      shadow(ctx, cx, bottom, w * 0.44, s * 0.09);
      ctx.fillStyle = PAL.wood3;
      ctx.fillRect(x + s * 0.16, y + h * 0.55, s * 0.1, h * 0.45);
      ctx.fillRect(x + w - s * 0.26, y + h * 0.55, s * 0.1, h * 0.45);
      ctx.fillStyle = vgrad(ctx, x, y + h * 0.2, h * 0.42, shade(PAL.wood1, 0.14), PAL.wood1);
      rr(ctx, x + s * 0.05, y + h * 0.2, w - s * 0.1, h * 0.42, s * 0.09); ctx.fill();
      // damier posé dessus
      const bw = w * 0.62, bx = cx - bw / 2, by = y + h * 0.24, cell = bw / 8;
      for (let i = 0; i < 8; i++) for (let j = 0; j < 4; j++) {
        ctx.fillStyle = (i + j) % 2 ? '#caa06a' : '#f4e7c8';
        ctx.fillRect(bx + i * cell, by + j * cell * 1.1, cell, cell * 1.1);
      }
      break;
    }
    case 'plant': {
      shadow(ctx, cx, bottom, s * 0.26, s * 0.07);
      ctx.fillStyle = PAL.leaf2;
      for (const [dx, dy, r] of [[-s * 0.14, -s * 0.44, s * 0.16], [s * 0.14, -s * 0.44, s * 0.16], [0, -s * 0.56, s * 0.18]]) {
        ctx.beginPath(); ctx.arc(cx + dx, bottom + dy, r, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = vgrad(ctx, cx, bottom - s * 0.3, s * 0.3, '#c17a45', '#a8623a');
      rr(ctx, cx - s * 0.2, bottom - s * 0.3, s * 0.4, s * 0.3, s * 0.05); ctx.fill();
      break;
    }
    case 'trophy': {
      shadow(ctx, cx, bottom, w * 0.4, s * 0.08);
      ctx.fillStyle = vgrad(ctx, x, y + h * 0.5, h * 0.5, PAL.wood1, PAL.wood2);
      rr(ctx, x + s * 0.1, y + h * 0.5, w - s * 0.2, h * 0.5, s * 0.06); ctx.fill();
      ctx.fillStyle = PAL.gold;
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.16, y + h * 0.16);
      ctx.quadraticCurveTo(cx - s * 0.16, y + h * 0.42, cx, y + h * 0.42);
      ctx.quadraticCurveTo(cx + s * 0.16, y + h * 0.42, cx + s * 0.16, y + h * 0.16);
      ctx.closePath(); ctx.fill();
      ctx.fillRect(cx - s * 0.03, y + h * 0.42, s * 0.06, h * 0.12);
      ctx.fillRect(cx - s * 0.12, y + h * 0.54, s * 0.24, s * 0.05);
      ctx.fillStyle = 'rgba(255,255,255,.6)';
      ctx.beginPath(); ctx.arc(cx - s * 0.06, y + h * 0.24, s * 0.03, 0, Math.PI * 2); ctx.fill();
      break;
    }
    case 'noticeboard': {
      shadow(ctx, cx, bottom, w * 0.44, s * 0.08);
      ctx.fillStyle = PAL.wood3;
      ctx.fillRect(x + s * 0.1, y + h * 0.5, s * 0.09, h * 0.5);
      ctx.fillRect(x + w - s * 0.19, y + h * 0.5, s * 0.09, h * 0.5);
      ctx.fillStyle = vgrad(ctx, x, y, h * 0.62, PAL.wood1, PAL.wood2);
      rr(ctx, x, y + h * 0.04, w, h * 0.6, s * 0.08); ctx.fill();
      ctx.fillStyle = PAL.white;
      rr(ctx, x + w * 0.12, y + h * 0.14, w * 0.32, h * 0.36, s * 0.03); ctx.fill();
      ctx.fillStyle = '#bfe4f2';
      rr(ctx, x + w * 0.56, y + h * 0.16, w * 0.3, h * 0.3, s * 0.03); ctx.fill();
      break;
    }
    case 'blackboard': {
      shadow(ctx, cx, bottom, w * 0.44, s * 0.08);
      ctx.fillStyle = PAL.wood3;
      ctx.fillRect(x + s * 0.1, y + h * 0.5, s * 0.09, h * 0.5);
      ctx.fillRect(x + w - s * 0.19, y + h * 0.5, s * 0.09, h * 0.5);
      ctx.fillStyle = PAL.wood2;
      rr(ctx, x, y + h * 0.02, w, h * 0.62, s * 0.08); ctx.fill();
      ctx.fillStyle = PAL.slate;
      rr(ctx, x + w * 0.08, y + h * 0.1, w * 0.84, h * 0.44, s * 0.04); ctx.fill();
      // petit damier + flèche à la craie
      ctx.fillStyle = PAL.chalk;
      const gx = x + w * 0.16, gy = y + h * 0.18, gc = h * 0.07;
      for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) if ((i + j) % 2) ctx.fillRect(gx + i * gc, gy + j * gc, gc, gc);
      ctx.strokeStyle = PAL.chalk; ctx.lineWidth = Math.max(1, s * 0.03);
      ctx.beginPath(); ctx.moveTo(x + w * 0.6, y + h * 0.42); ctx.lineTo(x + w * 0.8, y + h * 0.2); ctx.stroke();
      break;
    }
    case 'mat': {
      ctx.fillStyle = '#c88a48';
      rr(ctx, x + w * 0.1, y + h * 0.28, w * 0.8, h * 0.44, s * 0.08); ctx.fill();
      ctx.strokeStyle = '#b4783c'; ctx.lineWidth = Math.max(1, s * 0.03);
      ctx.strokeRect(x + w * 0.18, y + h * 0.38, w * 0.64, h * 0.24);
      break;
    }
    default:
      ctx.fillStyle = '#888';
      rr(ctx, x, y, w, h, s * 0.1); ctx.fill();
  }
}
