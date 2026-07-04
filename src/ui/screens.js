/**
 * Petites briques d'interface : gestion des écrans, création d'éléments,
 * bannières de message sur le damier.
 */

/** Affiche l'écran demandé (section .screen) et masque les autres. */
export function showScreen(id) {
  document.querySelectorAll('.screen').forEach((s) => s.classList.toggle('active', s.id === id));
}

/** Création d'élément expressive : el('button.btn.btn-primary', 'Jouer', {onclick}) */
export function el(spec, content, props = {}) {
  const [tag, ...classes] = spec.split('.');
  const node = document.createElement(tag || 'div');
  if (classes.length) node.className = classes.join(' ');
  if (content != null) {
    if (typeof content === 'string') node.textContent = content;
    else if (Array.isArray(content)) node.append(...content);
    else node.append(content);
  }
  Object.assign(node, props);
  return node;
}

let bannerTimer = 0;
/** Message temporaire au-dessus du damier ("Prise obligatoire !"…). */
export function showBanner(text, kind = 'warn', ms = 1800) {
  const b = document.getElementById('board-banner');
  if (!b) return;
  b.textContent = text;
  b.classList.remove('hidden');
  b.classList.toggle('info', kind === 'info');
  clearTimeout(bannerTimer);
  bannerTimer = setTimeout(() => b.classList.add('hidden'), ms);
}

/** Remplit l'overlay de fin de partie. buttons: [{label, className, onClick}] */
export function showMatchOverlay({ title, detail, rewards, buttons }) {
  const overlay = document.getElementById('match-overlay');
  document.getElementById('result-title').textContent = title;
  document.getElementById('result-detail').textContent = detail || '';
  const zone = document.getElementById('result-buttons');
  zone.innerHTML = '';
  const old = overlay.querySelectorAll('.reward-line');
  old.forEach((n) => n.remove());
  if (rewards) {
    for (const r of rewards) {
      zone.before(el('div.reward-line', r));
    }
  }
  for (const b of buttons) {
    zone.append(el(`button.btn.${b.className || 'btn-primary'}`, b.label, {
      onclick: () => { hideMatchOverlay(); b.onClick(); },
    }));
  }
  overlay.classList.remove('hidden');
}

export function hideMatchOverlay() {
  document.getElementById('match-overlay').classList.add('hidden');
}
