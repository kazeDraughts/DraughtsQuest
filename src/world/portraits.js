/**
 * Portraits et sprites de personnages dessinés au canvas (aucun asset externe).
 * Un personnage est décrit par une petite fiche de couleurs/attributs,
 * utilisée à la fois pour le portrait (dialogues) et le sprite (overworld).
 */

/**
 * Dessine un portrait (buste) dans un canvas.
 * cfg : { skin, hair, hairStyle: 'short'|'long'|'bald'|'bun'|'cap',
 *         shirt, beard?, glasses?, blush?, capColor? }
 */
export function drawPortrait(canvas, cfg, size = 64) {
  canvas.width = size;
  canvas.height = size;
  const x = canvas.getContext('2d');
  const u = size / 64; // unité d'échelle

  // Fond
  const bg = x.createLinearGradient(0, 0, 0, size);
  bg.addColorStop(0, cfg.bg || '#3b4d61');
  bg.addColorStop(1, '#26313d');
  x.fillStyle = bg;
  x.fillRect(0, 0, size, size);

  // Épaules / buste
  x.fillStyle = cfg.shirt;
  x.beginPath();
  x.ellipse(32 * u, 66 * u, 24 * u, 18 * u, 0, Math.PI, 0);
  x.fill();

  // Tête
  x.fillStyle = cfg.skin;
  x.beginPath();
  x.ellipse(32 * u, 32 * u, 15 * u, 17 * u, 0, 0, Math.PI * 2);
  x.fill();

  // Cheveux
  x.fillStyle = cfg.hair;
  if (cfg.hairStyle === 'short') {
    x.beginPath();
    x.ellipse(32 * u, 24 * u, 16 * u, 12 * u, 0, Math.PI, 0);
    x.fill();
  } else if (cfg.hairStyle === 'long') {
    x.beginPath();
    x.ellipse(32 * u, 26 * u, 17 * u, 14 * u, 0, Math.PI, 0);
    x.fill();
    x.fillRect(15 * u, 26 * u, 6 * u, 22 * u);
    x.fillRect(43 * u, 26 * u, 6 * u, 22 * u);
  } else if (cfg.hairStyle === 'bun') {
    x.beginPath();
    x.ellipse(32 * u, 24 * u, 16 * u, 11 * u, 0, Math.PI, 0);
    x.fill();
    x.beginPath();
    x.arc(32 * u, 13 * u, 7 * u, 0, Math.PI * 2);
    x.fill();
  } else if (cfg.hairStyle === 'cap') {
    x.fillStyle = cfg.capColor || '#d84f42';
    x.beginPath();
    x.ellipse(32 * u, 23 * u, 16.5 * u, 12 * u, 0, Math.PI, 0);
    x.fill();
    x.fillRect(15 * u, 21 * u, 34 * u, 4 * u);
    x.fillRect(40 * u, 21 * u, 16 * u, 4 * u); // visière
  } else if (cfg.hairStyle === 'grayfringe') {
    x.beginPath();
    x.ellipse(32 * u, 22 * u, 15 * u, 8 * u, 0, Math.PI, 0);
    x.fill();
  }
  // 'bald' : rien

  // Yeux
  x.fillStyle = '#232323';
  x.beginPath();
  x.arc(26 * u, 32 * u, 2.1 * u, 0, Math.PI * 2);
  x.arc(38 * u, 32 * u, 2.1 * u, 0, Math.PI * 2);
  x.fill();

  // Lunettes
  if (cfg.glasses) {
    x.strokeStyle = '#20242c';
    x.lineWidth = 1.6 * u;
    x.beginPath();
    x.arc(26 * u, 32 * u, 5.5 * u, 0, Math.PI * 2);
    x.moveTo(44 * u, 32 * u);
    x.arc(38.5 * u, 32 * u, 5.5 * u, 0, Math.PI * 2);
    x.moveTo(31.5 * u, 32 * u);
    x.lineTo(33 * u, 32 * u);
    x.stroke();
  }

  // Joues
  if (cfg.blush) {
    x.fillStyle = 'rgba(240,120,120,.45)';
    x.beginPath();
    x.arc(23 * u, 38 * u, 3.4 * u, 0, Math.PI * 2);
    x.arc(41 * u, 38 * u, 3.4 * u, 0, Math.PI * 2);
    x.fill();
  }

  // Bouche
  x.strokeStyle = '#7c3f2e';
  x.lineWidth = 1.6 * u;
  x.beginPath();
  x.arc(32 * u, 39 * u, 4.6 * u, 0.15 * Math.PI, 0.85 * Math.PI);
  x.stroke();

  // Barbe / moustache
  if (cfg.beard) {
    x.fillStyle = cfg.beard;
    x.beginPath();
    x.ellipse(32 * u, 45 * u, 11 * u, 7 * u, 0, 0, Math.PI);
    x.fill();
  }
  if (cfg.mustache) {
    x.fillStyle = cfg.mustache;
    x.beginPath();
    x.ellipse(32 * u, 36.5 * u, 7 * u, 2.6 * u, 0, 0, Math.PI);
    x.fill();
  }
}

/** Assombrit une couleur hexadécimale (#rrggbb) d'un facteur 0..1. */
function shade(hex, f) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.round(((n >> 16) & 255) * (1 - f));
  const g = Math.round(((n >> 8) & 255) * (1 - f));
  const b = Math.round((n & 255) * (1 - f));
  return `rgb(${r},${g},${b})`;
}

/**
 * Sprite « chibi » d'un personnage (style villageois) :
 * grosse tête ronde, grands yeux à reflet, frange/coiffure découpée,
 * petit corps, bras et jambes animés à la marche, contours doux.
 * (x, y) = centre des pieds ; s = taille d'une tuile ;
 * dir = 'up|down|left|right' ; step = phase de marche (0..1).
 */
export function drawCharacter(ctx, cfg, x, y, s, dir = 'down', step = 0) {
  const walking = step > 0;
  const swing = walking ? Math.sin(step * Math.PI * 2) : 0;
  const bob = walking ? Math.abs(Math.sin(step * Math.PI * 2)) * s * 0.035 : 0;
  const R = s * 0.30;                    // rayon de la tête (chibi : très grosse)
  const headY = y - s * 0.62 - bob;
  const bodyW = s * 0.36;
  const bodyH = s * 0.30;
  const bodyY = y - s * 0.34 - bob;
  const side = dir === 'left' ? -1 : dir === 'right' ? 1 : 0;
  const hairC = cfg.hairStyle === 'bald' ? cfg.skin : cfg.hair;
  const outline = 'rgba(70,45,30,.45)';
  const lw = Math.max(1, s * 0.022);

  ctx.save();
  ctx.lineWidth = lw;
  ctx.lineJoin = 'round';

  // --- ombre au sol ---
  ctx.fillStyle = 'rgba(20,60,20,.28)';
  ctx.beginPath();
  ctx.ellipse(x, y + s * 0.02, s * 0.24, s * 0.085, 0, 0, Math.PI * 2);
  ctx.fill();

  // --- jambes et chaussures ---
  const shoe = '#6b4a32';
  const legY = y - s * 0.02;
  const lOff = swing * s * 0.075;
  for (const [k, off] of [[-1, lOff], [1, -lOff]]) {
    ctx.fillStyle = shade(cfg.shirt, 0.35); // petit pantalon assorti
    ctx.beginPath();
    ctx.roundRect(x + k * s * 0.055 + (side ? side * s * 0.02 : 0) - s * 0.045,
      bodyY + bodyH - s * 0.03 + (off < 0 ? 0 : off * 0.4), s * 0.09, s * 0.14, s * 0.04);
    ctx.fill();
    ctx.fillStyle = shoe;
    ctx.beginPath();
    ctx.ellipse(x + k * s * 0.055 + (side ? side * s * 0.02 : 0), legY + off * 0.5,
      s * 0.062, s * 0.045, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // --- corps (maillot en capsule) ---
  ctx.fillStyle = cfg.shirt;
  ctx.strokeStyle = outline;
  ctx.beginPath();
  ctx.roundRect(x - bodyW / 2, bodyY, bodyW, bodyH, [s * 0.07, s * 0.07, s * 0.12, s * 0.12]);
  ctx.fill();
  ctx.stroke();
  // liseré de col
  ctx.fillStyle = 'rgba(255,255,255,.25)';
  ctx.fillRect(x - bodyW * 0.28, bodyY + lw, bodyW * 0.56, s * 0.03);

  // --- bras (manche + main) ---
  const armSwing = swing * s * 0.05;
  for (const k of [-1, 1]) {
    const ax = x + k * (bodyW / 2 + s * 0.015);
    const ay = bodyY + bodyH * 0.18 + (k === 1 ? armSwing : -armSwing);
    ctx.fillStyle = cfg.shirt;
    ctx.beginPath();
    ctx.roundRect(ax - s * 0.04, ay, s * 0.08, bodyH * 0.62, s * 0.04);
    ctx.fill();
    ctx.strokeStyle = outline;
    ctx.stroke();
    ctx.fillStyle = cfg.skin;
    ctx.beginPath();
    ctx.arc(ax, ay + bodyH * 0.68, s * 0.038, 0, Math.PI * 2);
    ctx.fill();
  }

  // --- tête ---
  ctx.fillStyle = cfg.skin;
  ctx.strokeStyle = outline;
  ctx.beginPath();
  ctx.arc(x, headY, R, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // petites oreilles (profil et face)
  if (dir !== 'up') {
    ctx.fillStyle = cfg.skin;
    for (const k of [-1, 1]) {
      if (side && k === side) continue; // l'oreille du côté regardé est cachée
      ctx.beginPath();
      ctx.arc(x + k * R * 0.98, headY + R * 0.12, R * 0.14, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // --- chevelure : calotte + frange (avant), ou nuque pleine (dos) ---
  const capC = cfg.capColor || '#d84f42';
  const domeC = cfg.hairStyle === 'cap' ? capC : hairC;
  ctx.fillStyle = domeC;
  ctx.beginPath();
  if (dir === 'up') {
    // Vue de dos : la chevelure couvre presque toute la tête
    ctx.arc(x, headY, R * 1.02, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Calotte : moitié haute + frange en festons
    const fr = headY - R * 0.02 + (side ? R * 0.05 : R * 0.12); // ligne de frange
    ctx.arc(x, headY, R * 1.02, Math.PI, 0);
    if (cfg.hairStyle === 'grayfringe' || cfg.hairStyle === 'bald') {
      ctx.closePath();
      ctx.fill();
    } else {
      // festons de frange (3 arcs)
      const w3 = (R * 2.04) / 3;
      for (let i = 2; i >= 0; i--) {
        const cxF = x - R * 1.02 + w3 * (i + 0.5) + side * R * 0.1;
        ctx.lineTo(cxF + w3 / 2, fr);
        ctx.arc(cxF, fr, w3 / 2, 0, Math.PI);
      }
      ctx.closePath();
      ctx.fill();
    }
  }

  // Styles particuliers
  if (cfg.hairStyle === 'long' && dir !== 'up') {
    ctx.fillStyle = hairC;
    for (const k of [-1, 1]) {
      ctx.beginPath();
      ctx.roundRect(x + k * R * 0.78 - R * 0.22, headY - R * 0.1, R * 0.44, R * 1.5, R * 0.22);
      ctx.fill();
    }
  }
  if (cfg.hairStyle === 'long' && dir === 'up') {
    ctx.fillStyle = hairC;
    ctx.beginPath();
    ctx.roundRect(x - R * 0.55, headY, R * 1.1, R * 1.6, R * 0.4);
    ctx.fill();
  }
  if (cfg.hairStyle === 'bun') {
    ctx.fillStyle = hairC;
    ctx.beginPath();
    ctx.arc(x + (dir === 'up' ? 0 : 0), headY - R * (dir === 'up' ? 0.4 : 0.95), R * 0.34, 0, Math.PI * 2);
    ctx.fill();
  }
  if (cfg.hairStyle === 'grayfringe' && dir !== 'up') {
    // Couronne de cheveux sur les tempes, crâne dégarni
    ctx.fillStyle = cfg.skin;
    ctx.beginPath();
    ctx.arc(x, headY - R * 0.25, R * 0.72, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = hairC;
    for (const k of [-1, 1]) {
      ctx.beginPath();
      ctx.arc(x + k * R * 0.85, headY + R * 0.05, R * 0.24, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  if (cfg.hairStyle === 'cap') {
    // Visière et bouton de casquette
    ctx.fillStyle = shade(capC, 0.2);
    if (dir === 'down') {
      ctx.beginPath();
      ctx.ellipse(x, headY - R * 0.05, R * 0.95, R * 0.28, 0, 0, Math.PI);
      ctx.fill();
    } else if (side) {
      ctx.beginPath();
      ctx.ellipse(x + side * R * 0.75, headY - R * 0.1, R * 0.5, R * 0.2, side * 0.25, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = shade(capC, 0.35);
    ctx.beginPath();
    ctx.arc(x, headY - R * 0.98, R * 0.12, 0, Math.PI * 2);
    ctx.fill();
  }

  // --- visage ---
  if (dir !== 'up') {
    const eyeY = headY + R * 0.22;
    const eyes = dir === 'down' ? [-R * 0.42, R * 0.42] : [side * R * 0.45];
    for (const ex of eyes) {
      // blanc, iris, reflet : les grands yeux font tout le charme
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.ellipse(x + ex, eyeY, R * 0.17, R * 0.24, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#3a2e28';
      ctx.beginPath();
      ctx.ellipse(x + ex + side * R * 0.04, eyeY + R * 0.03, R * 0.11, R * 0.17, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(x + ex - R * 0.03, eyeY - R * 0.06, R * 0.05, 0, Math.PI * 2);
      ctx.fill();
    }
    if (cfg.glasses) {
      ctx.strokeStyle = '#20242c';
      ctx.lineWidth = Math.max(1, s * 0.018);
      for (const ex of eyes) {
        ctx.beginPath();
        ctx.arc(x + ex, eyeY, R * 0.26, 0, Math.PI * 2);
        ctx.stroke();
      }
      if (dir === 'down') {
        ctx.beginPath();
        ctx.moveTo(x - R * 0.16, eyeY);
        ctx.lineTo(x + R * 0.16, eyeY);
        ctx.stroke();
      }
      ctx.lineWidth = lw;
    }
    // joues
    if (cfg.blush) {
      ctx.fillStyle = 'rgba(245,130,120,.4)';
      for (const ex of eyes) {
        ctx.beginPath();
        ctx.ellipse(x + ex, eyeY + R * 0.34, R * 0.14, R * 0.09, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    // bouche
    ctx.strokeStyle = '#8a4a38';
    ctx.beginPath();
    ctx.arc(x + side * R * 0.3, headY + R * 0.55, R * 0.14, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();
    // moustache / barbe
    if (cfg.mustache) {
      ctx.fillStyle = cfg.mustache;
      ctx.beginPath();
      ctx.ellipse(x + side * R * 0.3, headY + R * 0.48, R * 0.3, R * 0.1, 0, 0, Math.PI);
      ctx.fill();
    }
    if (cfg.beard) {
      ctx.fillStyle = cfg.beard;
      ctx.beginPath();
      ctx.ellipse(x + side * R * 0.15, headY + R * 0.78, R * 0.5, R * 0.3, 0, 0, Math.PI);
      ctx.fill();
    }
  }

  ctx.restore();
}
