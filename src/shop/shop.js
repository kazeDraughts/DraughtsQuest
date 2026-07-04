/**
 * Boutique de Mme Plot : achat et équipement des damiers et pions
 * cosmétiques avec les Pions d'Or gagnés en jouant.
 */

import { BOARD_THEMES, PIECE_THEMES } from './themes.js';
import { drawPiece } from '../game/boardview.js';
import { state, save } from '../save/save.js';
import { el } from '../ui/screens.js';
import { audio } from '../audio/audio.js';

/** Aperçu d'un damier : petite grille aux couleurs du thème. */
function boardPreview(theme) {
  const c = document.createElement('canvas');
  c.width = 160;
  c.height = 90;
  const x = c.getContext('2d');
  const s = 160 / 6;
  x.fillStyle = theme.border;
  x.fillRect(0, 0, 160, 90);
  for (let j = 0; j < 3; j++) {
    for (let i = 0; i < 6; i++) {
      x.fillStyle = (i + j) % 2 ? theme.dark : theme.light;
      x.fillRect(4 + i * (152 / 6), 4 + j * (82 / 3), 152 / 6, 82 / 3);
      if ((i + j) % 2 && theme.gridGlow) {
        x.strokeStyle = theme.glow;
        x.globalAlpha = 0.4;
        x.strokeRect(5 + i * (152 / 6), 5 + j * (82 / 3), 152 / 6 - 2, 82 / 3 - 2);
        x.globalAlpha = 1;
      }
    }
  }
  void s;
  return c;
}

/** Aperçu d'un jeu de pièces : un pion et une dame de chaque camp. */
function piecesPreview(theme) {
  const c = document.createElement('canvas');
  c.width = 160;
  c.height = 90;
  const x = c.getContext('2d');
  x.fillStyle = '#2d3c4d';
  x.fillRect(0, 0, 160, 90);
  drawPiece(x, 40, 45, 84, 'w', theme, '#2d3c4d');
  drawPiece(x, 120, 45, 84, 'B', theme, '#2d3c4d');
  return c;
}

/**
 * Affiche la boutique dans #screen-shop.
 * hooks : { onChange() } — appelé après achat/équipement (HUD, sauvegarde…)
 */
export function renderShop(onChange = () => {}) {
  document.getElementById('shop-points').textContent = `🪙 ${state.points} Pions d'Or`;

  const renderSection = (zoneId, catalog, kind) => {
    const zone = document.getElementById(zoneId);
    zone.innerHTML = '';
    for (const item of catalog) {
      const owned = state.inventory[kind].includes(item.id);
      const equipped = state.equipped[kind === 'boards' ? 'board' : 'pieces'] === item.id;
      const card = el('div.shop-card');
      if (equipped) card.classList.add('equipped');
      card.append(kind === 'boards' ? boardPreview(item) : piecesPreview(item));
      card.append(el('div.shop-name', item.name));
      card.append(el('div.shop-desc', item.desc));

      if (equipped) {
        card.append(el('button.btn.btn-small.btn-good', 'Équipé ✓', { disabled: true }));
      } else if (owned) {
        card.append(el('button.btn.btn-small.btn-good', 'Équiper', {
          onclick: () => {
            state.equipped[kind === 'boards' ? 'board' : 'pieces'] = item.id;
            save();
            audio.playSfx('blip');
            renderShop(onChange);
            onChange();
          },
        }));
      } else {
        const canAfford = state.points >= item.price;
        card.append(el('button.btn.btn-small.btn-primary', `Acheter · 🪙 ${item.price}`, {
          disabled: !canAfford,
          onclick: () => {
            if (state.points < item.price) return;
            state.points -= item.price;
            state.inventory[kind].push(item.id);
            state.equipped[kind === 'boards' ? 'board' : 'pieces'] = item.id;
            save();
            audio.playSfx('coin');
            renderShop(onChange);
            onChange();
          },
        }));
        if (!canAfford) card.append(el('div.tag-elo', 'Pions d\'Or insuffisants'));
      }
      zone.append(card);
    }
  };

  renderSection('shop-boards', BOARD_THEMES, 'boards');
  renderSection('shop-pieces', PIECE_THEMES, 'pieces');
}
