/**
 * Système de dialogues : boîte avec portrait, nom, texte au fil de l'eau
 * (machine à écrire), enchaînement de répliques et choix multiples.
 * Tactile et clavier : toucher/cliquer ou E/Espace/Entrée pour avancer.
 *
 * Utilisation :
 *   const d = new Dialogue(containerElement);
 *   const answer = await d.play([
 *     { who: 'grandpa', text: 'Bonjour petit !' },
 *     { who: 'player', text: 'Bonjour Papi !' },
 *     { who: 'grandpa', text: 'Une petite partie ?', choices: [
 *       { label: 'Oui !', value: 'yes' }, { label: 'Plus tard', value: 'no' },
 *     ] },
 *   ]);
 */

import { characterById } from './npcs.js';
import { drawPortrait } from './portraits.js';
import { el } from '../ui/screens.js';

export class Dialogue {
  constructor(container) {
    this.container = container;
    this.box = null;
    this.isOpen = false;
    this._keyHandler = (e) => {
      const k = e.key.toLowerCase();
      if (k === 'e' || k === ' ' || k === 'enter') {
        e.preventDefault();
        e.stopPropagation();
        this._advance?.();
      }
    };
  }

  /** Joue une suite de répliques ; résout avec la valeur du dernier choix. */
  async play(lines) {
    this._ensureBox();
    this.isOpen = true;
    this.box.classList.remove('hidden');
    // Capture du clavier en priorité sur l'overworld
    window.addEventListener('keydown', this._keyHandler, { capture: true });

    let answer;
    for (const line of lines) {
      answer = await this._playLine(line);
    }
    this.close();
    return answer;
  }

  close() {
    this.isOpen = false;
    this._advance = null;
    this.box?.classList.add('hidden');
    window.removeEventListener('keydown', this._keyHandler, { capture: true });
  }

  _ensureBox() {
    if (this.box) return;
    this.portraitCanvas = el('canvas');
    this.nameEl = el('div.dialogue-name');
    this.textEl = el('div.dialogue-text');
    this.nextEl = el('div.dialogue-next', '▼ continuer');
    this.choicesEl = el('div.dialogue-choices');
    this.box = el('div.dialogue-box.hidden', [
      el('div.dialogue-portrait', this.portraitCanvas),
      el('div.dialogue-content', [this.nameEl, this.textEl, this.choicesEl, this.nextEl]),
    ]);
    this.box.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      this._advance?.();
    });
    this.container.append(this.box);
  }

  _playLine(line) {
    return new Promise((resolve) => {
      const who = characterById(line.who || 'player');
      this.nameEl.textContent = line.name || who.name;
      drawPortrait(this.portraitCanvas, who.look, 96);
      this.choicesEl.innerHTML = '';
      this.nextEl.style.visibility = 'hidden';

      // Machine à écrire
      const text = line.text;
      let i = 0;
      let done = false;
      this.textEl.textContent = '';
      const tick = () => {
        if (done) return;
        i = Math.min(text.length, i + 1);
        this.textEl.textContent = text.slice(0, i);
        if (i < text.length) {
          this._timer = setTimeout(tick, 16);
        } else {
          finishTyping();
        }
      };

      const finishTyping = () => {
        if (done) return;
        done = true;
        clearTimeout(this._timer);
        this.textEl.textContent = text;
        if (line.choices) {
          // Afficher les choix : la suite passe par les boutons.
          this._advance = null;
          for (const c of line.choices) {
            this.choicesEl.append(el('button.btn', c.label, {
              onclick: (e) => {
                e.stopPropagation();
                resolve(c.value);
              },
            }));
          }
        } else {
          this.nextEl.style.visibility = 'visible';
          this._advance = () => {
            this._advance = null;
            resolve(undefined);
          };
        }
      };

      // Un premier "avancer" complète le texte ; le second passe à la suite.
      this._advance = () => finishTyping();
      tick();
    });
  }
}
