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

/**
 * Dessine le sprite d'un personnage vu de dessus dans un contexte 2D.
 * (x, y) = centre des pieds ; s = taille d'une tuile ; dir = 'up|down|left|right'
 * step : phase de marche (0..1) pour le balancement.
 */
export function drawCharacter(ctx, cfg, x, y, s, dir = 'down', step = 0) {
  const bob = Math.sin(step * Math.PI * 2) * s * 0.04;
  const r = s * 0.32;

  // Ombre
  ctx.fillStyle = 'rgba(0,0,0,.25)';
  ctx.beginPath();
  ctx.ellipse(x, y, r * 0.9, r * 0.4, 0, 0, Math.PI * 2);
  ctx.fill();

  const top = y - s * 0.52 + bob;

  // Corps
  ctx.fillStyle = cfg.shirt;
  ctx.beginPath();
  ctx.ellipse(x, y - s * 0.22 + bob, r * 0.8, r * 0.62, 0, 0, Math.PI * 2);
  ctx.fill();

  // Tête
  ctx.fillStyle = cfg.skin;
  ctx.beginPath();
  ctx.arc(x, top, r * 0.72, 0, Math.PI * 2);
  ctx.fill();

  // Cheveux / casquette (vus de dessus : calotte)
  ctx.fillStyle = cfg.hairStyle === 'cap' ? (cfg.capColor || '#d84f42')
    : cfg.hairStyle === 'bald' ? cfg.skin : cfg.hair;
  ctx.beginPath();
  ctx.arc(x, top - r * 0.12, r * 0.62, 0, Math.PI * 2);
  ctx.fill();
  if (cfg.hairStyle === 'long') {
    // Cheveux longs : mèches qui tombent sur les côtés
    ctx.beginPath();
    ctx.arc(x - r * 0.55, top + r * 0.25, r * 0.28, 0, Math.PI * 2);
    ctx.arc(x + r * 0.55, top + r * 0.25, r * 0.28, 0, Math.PI * 2);
    ctx.fill();
  }
  if (cfg.hairStyle === 'cap') {
    // Visière orientée
    const vx = dir === 'left' ? -1 : dir === 'right' ? 1 : 0;
    const vy = dir === 'up' ? -1 : dir === 'down' ? 1 : 0;
    ctx.beginPath();
    ctx.ellipse(x + vx * r * 0.55, top - r * 0.1 + vy * r * 0.55, r * 0.42, r * 0.28,
      vx !== 0 ? Math.PI / 2 : 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Yeux selon la direction (pas d'yeux si dos tourné)
  if (dir !== 'up') {
    const ex = dir === 'left' ? -r * 0.34 : dir === 'right' ? r * 0.34 : 0;
    ctx.fillStyle = '#232323';
    ctx.beginPath();
    if (dir === 'down') {
      ctx.arc(x - r * 0.26 + ex, top + r * 0.16, r * 0.1, 0, Math.PI * 2);
      ctx.arc(x + r * 0.26 + ex, top + r * 0.16, r * 0.1, 0, Math.PI * 2);
    } else {
      ctx.arc(x + ex, top + r * 0.12, r * 0.11, 0, Math.PI * 2);
    }
    ctx.fill();
  }
}
