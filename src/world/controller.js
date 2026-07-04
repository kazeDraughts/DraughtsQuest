/**
 * WorldController — relie le moteur d'overworld au reste du jeu :
 * dialogues scénarisés, portes (avec verrous d'histoire), transitions,
 * joystick tactile, sauvegarde de la position, lancement des parties.
 *
 * main.js fournit les « services » : startMatch (bascule vers l'écran de
 * partie), openShop, openCompetitions, toMenu.
 */

import { Overworld } from './overworld.js';
import { Dialogue } from './dialogue.js';
import { getNpcDialogue, onMapEntered, currentObjective } from '../story/quests.js';
import { characterById } from './npcs.js';
import { state, save, flag, setFlag } from '../save/save.js';

export class WorldController {
  constructor({ services }) {
    this.services = services; // { startMatch, openShop, openCompetitions, toMenu, sfx }
    this.screen = document.getElementById('screen-world');
    this.canvas = document.getElementById('world-canvas');
    this.dialogue = new Dialogue(this.screen);
    this.fade = document.getElementById('world-fade');

    this.world = new Overworld(this.canvas, {
      onDoor: (target) => this._changeMap(target),
      onNpc: (id) => this._talkTo(id),
      onAction: (action, ref) => this._onAction(action, ref),
      onSign: (text) => this.say([{ who: 'player', name: 'Panneau', text }]),
      isDoorLocked: (door) => !flag(door.lockFlag),
      onLockedDoor: (door) => this.say([{ who: 'player', name: 'Porte close', text: door.lockedMessage || 'C\'est fermé.' }]),
      playerLook: () => characterById('player').look,
    });

    this._setupTouch();
  }

  // ------------------------------------------------------------- navigation
  /** Entre dans le monde (depuis le menu ou au retour d'une partie). */
  enter() {
    const w = state.world;
    this.world.loadMap(w.map, { x: w.x, y: w.y, dir: w.dir });
    this.world.start();
    this._onMapEntered(w.map);
  }

  leave() {
    this._savePosition();
    this.world.stop();
    this.dialogue.close();
    this.world.paused = false;
  }

  _savePosition() {
    if (!this.world.map) return;
    state.world = {
      map: this.world.map.id,
      x: this.world.player.x,
      y: this.world.player.y,
      dir: this.world.player.dir,
    };
    save();
  }

  async _changeMap(target) {
    this.services.sfx?.('door');
    await this._fadeOut();
    this.world.loadMap(target.map, target);
    this._savePosition();
    await this._fadeIn();
    this._onMapEntered(target.map);
  }

  /** Événements automatiques à l'arrivée sur une carte (scénario). */
  async _onMapEntered(mapId) {
    this.services.onMapChanged?.(this.world.map);
    this.updateHud();
    await onMapEntered(mapId, this._questCtx());
    this.updateHud();
  }

  /** Rafraîchit l'objectif de quête et le compteur de points. */
  updateHud() {
    const quest = document.getElementById('hud-quest');
    const objective = currentObjective(flag, state);
    quest.classList.toggle('hidden', !objective);
    quest.innerHTML = '';
    if (objective) {
      const b = document.createElement('b');
      b.textContent = 'Objectif';
      quest.append(b, objective);
    }
    this.services.updateHud?.();
  }

  _fadeOut() {
    return new Promise((r) => {
      this.fade.classList.add('on');
      setTimeout(r, 280);
    });
  }

  _fadeIn() {
    return new Promise((r) => {
      this.fade.classList.remove('on');
      setTimeout(r, 280);
    });
  }

  // -------------------------------------------------------------- dialogues
  /** Joue des répliques en figeant le monde. */
  async say(lines) {
    this.world.paused = true;
    const answer = await this.dialogue.play(lines);
    this.world.paused = false;
    this.updateHud();
    return answer;
  }

  async _talkTo(npcId) {
    this.world.faceNpcToPlayer(npcId);
    this.services.sfx?.('blip');
    const ctx = this._questCtx();
    const d = getNpcDialogue(npcId, ctx);
    if (!d) return;
    const answer = await this.say(d.lines);
    d.onDone?.(answer);
  }

  _onAction(action, ref) {
    this.services.sfx?.('blip');
    const ctx = this._questCtx();
    if (action === 'grandpa_board') {
      this.say([{ who: 'player', text: 'Le damier de Papi. Les pièces sont usées d\'avoir tant joué…' }]);
    } else if (action === 'competitions') {
      if (this.services.openCompetitions) this.services.openCompetitions(ctx);
      else this.say([{ who: 'player', name: 'Tableau d\'affichage', text: 'Les prochains tournois seront annoncés bientôt.' }]);
    }
  }

  /** Contexte passé au scénario (quests.js). */
  questCtx() {
    return {
      flag,
      setFlag,
      state,
      say: (lines) => this.say(lines),
      startMatch: (cfg) => {
        this._savePosition();
        this.services.startMatch(cfg);
      },
      startTutorial: () => {
        this._savePosition();
        this.services.startTutorial?.();
      },
      openShop: () => this.services.openShop?.(),
      openCompetitions: () => this.services.openCompetitions?.(),
    };
  }

  _questCtx() {
    return this.questCtx();
  }

  // ---------------------------------------------------------------- tactile
  _setupTouch() {
    const joy = document.getElementById('joystick');
    const stick = joy.querySelector('.stick');
    const btnA = document.getElementById('btn-action');
    let pointerId = null;

    const setStick = (dx, dy) => {
      stick.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
    };

    joy.addEventListener('pointerdown', (e) => {
      pointerId = e.pointerId;
      joy.setPointerCapture(pointerId);
      moveStick(e);
    });
    const moveStick = (e) => {
      if (e.pointerId !== pointerId) return;
      const r = joy.getBoundingClientRect();
      let dx = e.clientX - (r.left + r.width / 2);
      let dy = e.clientY - (r.top + r.height / 2);
      const max = r.width / 2 - 18;
      const len = Math.hypot(dx, dy);
      if (len > max) {
        dx = (dx / len) * max;
        dy = (dy / len) * max;
      }
      setStick(dx, dy);
      // Zone morte de 25 % pour éviter les dérives
      const nx = Math.abs(dx) / max > 0.25 ? dx / max : 0;
      const ny = Math.abs(dy) / max > 0.25 ? dy / max : 0;
      this.world.joy = { x: nx, y: ny };
    };
    joy.addEventListener('pointermove', moveStick);
    const release = (e) => {
      if (e.pointerId !== pointerId) return;
      pointerId = null;
      setStick(0, 0);
      this.world.joy = { x: 0, y: 0 };
    };
    joy.addEventListener('pointerup', release);
    joy.addEventListener('pointercancel', release);

    btnA.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      if (this.dialogue.isOpen) {
        // Pendant un dialogue, le bouton A fait avancer le texte.
        this.dialogue._advance?.();
      } else {
        this.world.triggerAction();
      }
    });
  }
}
