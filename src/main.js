/**
 * DraughtsQuest — point d'entrée.
 * Assemble les briques : menu, damier (BoardView), contrôleur de partie (Match).
 */

import { BoardView } from './game/boardview.js';
import { Match } from './game/match.js';
import { showScreen, showBanner, showMatchOverlay, el } from './ui/screens.js';
import { AIPlayer } from './ai/player.js';
import { AI_LEVELS, LEVEL_ORDER } from './ai/levels.js';
import { WorldController } from './world/controller.js';
import { CHARACTERS, characterById } from './world/npcs.js';
import { drawPortrait } from './world/portraits.js';
import { loadSave } from './save/save.js';

const $ = (id) => document.getElementById(id);

// ---------------------------------------------------------------------------
// Damier partagé par toutes les parties
// ---------------------------------------------------------------------------
const boardView = new BoardView($('board-canvas'));
let currentMatch = null;
let matchOrigin = 'menu'; // 'menu' ou 'world' : où revenir en quittant la partie

/** Avatar d'un camp : id de personnage (portrait dessiné) ou emoji. */
function setAvatar(spanId, who) {
  const span = $(spanId);
  span.innerHTML = '';
  if (who && CHARACTERS[who]) {
    const c = document.createElement('canvas');
    drawPortrait(c, CHARACTERS[who].look, 76);
    span.append(c);
  } else {
    span.textContent = who || '⚪';
  }
}

/**
 * Lance une partie sur l'écran de jeu.
 * config : { white, black, fen, allowedMoves, onEnd({winner, resigned}) }
 * Les joueurs : { type:'human'|'ai', name, avatar? , getMove? }
 */
function startMatch(config) {
  currentMatch?.destroy();
  showScreen('screen-match');

  $('name-white').textContent = config.white.name;
  $('name-black').textContent = config.black.name;
  setAvatar('avatar-white', config.white.avatar ?? '⚪');
  setAvatar('avatar-black', config.black.avatar ?? '⚫');
  $('extra-white').textContent = config.white.extra ?? '';
  $('extra-black').textContent = config.black.extra ?? '';
  matchOrigin = config.origin ?? 'menu';

  const match = new Match({
    boardView,
    white: config.white,
    black: config.black,
    fen: config.fen,
    allowedMoves: config.allowedMoves,
    onMessage: (msg) => showBanner(msg),
    onTurn: (color, player) => {
      const pill = $('turn-pill');
      if (player.type === 'ai') {
        pill.innerHTML = '';
        pill.append(el('span.spin'), ` ${player.name} réfléchit…`);
      } else {
        pill.textContent = color === 'w' ? `Trait aux Blancs — ${config.white.name}` : `Trait aux Noirs — ${config.black.name}`;
      }
      pill.classList.toggle('me', player.type === 'human');
    },
    onMove: () => {},
    onEnd: (result) => {
      const names = { w: config.white.name, b: config.black.name };
      const title = result.winner === 'draw' ? 'Partie nulle !' : `${names[result.winner]} gagne !`;
      const detail = result.resigned
        ? 'Victoire par abandon.'
        : result.winner === 'draw'
          ? 'Aucun des deux camps ne peut l\'emporter.'
          : 'L\'adversaire ne peut plus jouer.';
      (config.onEnd || defaultMatchEnd)({ ...result, title, detail });
    },
  });
  currentMatch = match;
  match.start();
  return match;
}

function defaultMatchEnd({ title, detail }) {
  showMatchOverlay({
    title,
    detail,
    buttons: [
      { label: 'Rejouer', className: 'btn-primary', onClick: () => startLocalMatch() },
      { label: 'Menu principal', className: 'btn-small', onClick: () => quitToMenu() },
    ],
  });
}

function quitToMenu() {
  currentMatch?.destroy();
  currentMatch = null;
  showScreen('screen-menu');
}

// ---------------------------------------------------------------------------
// Modes de jeu
// ---------------------------------------------------------------------------
function startLocalMatch() {
  startMatch({
    white: { type: 'human', name: 'Joueur 1 (Blancs)' },
    black: { type: 'human', name: 'Joueur 2 (Noirs)' },
    onEnd: (r) => showMatchOverlay({
      title: r.title,
      detail: r.detail,
      buttons: [
        { label: 'Rejouer', className: 'btn-primary', onClick: () => startLocalMatch() },
        { label: 'Menu principal', className: 'btn-small', onClick: () => quitToMenu() },
      ],
    }),
  });
}

/** Partie libre contre l'IA (le joueur a les Blancs). */
function startAIMatch(levelId) {
  const level = AI_LEVELS[levelId];
  const ai = new AIPlayer(levelId);
  startMatch({
    white: { type: 'human', name: 'Toi (Blancs)' },
    black: {
      type: 'ai',
      name: level.name,
      avatar: level.icon,
      extra: `Elo ~${level.elo}`,
      getMove: (fen) => ai.getMove(fen),
    },
    onEnd: (r) => showMatchOverlay({
      title: r.winner === 'w' ? 'Victoire ! 🎉' : r.winner === 'draw' ? 'Partie nulle' : 'Défaite…',
      detail: r.winner === 'w'
        ? `Tu as battu ${level.name} !`
        : r.winner === 'draw' ? 'Personne ne peut plus gagner.' : `${level.name} l'emporte. Retente ta chance !`,
      buttons: [
        { label: 'Revanche', className: 'btn-primary', onClick: () => startAIMatch(levelId) },
        { label: 'Changer de niveau', className: 'btn-good', onClick: () => { quitToMenu(); openAISelect(); } },
        { label: 'Menu principal', className: 'btn-small', onClick: () => quitToMenu() },
      ],
    }),
  });
}

// --- Sélecteur de niveau de l'IA ---
function openAISelect() {
  const zone = $('ai-level-buttons');
  zone.innerHTML = '';
  for (const id of LEVEL_ORDER) {
    const lv = AI_LEVELS[id];
    const btn = el('button.btn', `${lv.icon} ${lv.name} — ${lv.desc}`, {
      onclick: () => {
        $('ai-select').classList.add('hidden');
        startAIMatch(id);
      },
    });
    btn.style.textAlign = 'left';
    zone.append(btn);
  }
  $('ai-select').classList.remove('hidden');
}

// ---------------------------------------------------------------------------
// Aventure (overworld)
// ---------------------------------------------------------------------------
let world = null;

function enterWorld() {
  if (!world) {
    world = new WorldController({
      services: {
        startMatch: (cfg) => startWorldMatch(cfg),
        toMenu: () => quitToMenu(),
        sfx: () => {},
      },
    });
  }
  currentMatch?.destroy();
  currentMatch = null;
  showScreen('screen-world');
  world.enter();
}

function leaveWorldToMenu() {
  world?.leave();
  showScreen('screen-menu');
}

/**
 * Partie lancée depuis le monde (PNJ) : l'adversaire est un personnage,
 * le résultat revient au scénario via cfg.onEnd, puis retour au monde.
 */
function startWorldMatch(cfg) {
  world.leave();
  const opp = characterById(cfg.opponent);
  const levelCfg = typeof cfg.level === 'string' ? AI_LEVELS[cfg.level] : cfg.level;
  const ai = new AIPlayer(cfg.level);
  startMatch({
    origin: 'world',
    fen: cfg.fen,
    allowedMoves: cfg.allowedMoves,
    white: { type: 'human', name: 'Tim', avatar: 'player' },
    black: {
      type: 'ai',
      name: opp.name,
      avatar: opp.id,
      extra: cfg.extra ?? (levelCfg ? `Force ~${levelCfg.elo}` : ''),
      getMove: (fen) => ai.getMove(fen),
    },
    onEnd: (r) => {
      if (cfg.onEnd) {
        cfg.onEnd(r);
        return;
      }
      const won = r.winner === 'w';
      showMatchOverlay({
        title: won ? 'Victoire ! 🎉' : r.winner === 'draw' ? 'Partie nulle' : 'Défaite…',
        detail: won ? `Bien joué, tu as battu ${opp.name} !`
          : r.winner === 'draw' ? 'Personne ne l\'emporte cette fois.'
            : `${opp.name} l'emporte. Tu feras mieux la prochaine fois !`,
        buttons: [
          { label: 'Retour au monde', className: 'btn-primary', onClick: () => enterWorld() },
        ],
      });
    },
  });
}

// ---------------------------------------------------------------------------
// Boutons de l'écran de partie
// ---------------------------------------------------------------------------
$('btn-resign').addEventListener('click', () => {
  if (!currentMatch || currentMatch.finished) return;
  // Dans l'aventure, l'humain (Blancs) abandonne ; en local, le camp au trait.
  currentMatch.resign(matchOrigin === 'world' ? 'w' : currentMatch.engine.turn());
});
$('btn-quit-match').addEventListener('click', () => {
  if (matchOrigin === 'world') {
    if (currentMatch && !currentMatch.finished) currentMatch.resign('w');
    else enterWorld();
  } else {
    quitToMenu();
  }
});
$('btn-world-menu').addEventListener('click', () => leaveWorldToMenu());

// ---------------------------------------------------------------------------
// Menu principal
// ---------------------------------------------------------------------------
$('btn-local').addEventListener('click', () => startLocalMatch());
$('btn-vs-ai').addEventListener('click', () => openAISelect());
$('btn-ai-cancel').addEventListener('click', () => $('ai-select').classList.add('hidden'));
$('btn-adventure').addEventListener('click', () => enterWorld());

loadSave();
showScreen('screen-menu');

// Petit crochet de débogage / tests automatisés (sans effet en jeu normal).
window.__dq = {
  boardView,
  get match() { return currentMatch; },
  get world() { return world; },
  startMatch,
};
