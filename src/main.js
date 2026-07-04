/**
 * DraughtsQuest — point d'entrée.
 * Assemble les briques : menu, damier (BoardView), contrôleur de partie (Match).
 */

import { BoardView } from './game/boardview.js';
import { Match } from './game/match.js';
import { showScreen, showBanner, showMatchOverlay } from './ui/screens.js';

const $ = (id) => document.getElementById(id);

// ---------------------------------------------------------------------------
// Damier partagé par toutes les parties
// ---------------------------------------------------------------------------
const boardView = new BoardView($('board-canvas'));
let currentMatch = null;

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
  $('avatar-white').textContent = config.white.avatar ?? '⚪';
  $('avatar-black').textContent = config.black.avatar ?? '⚫';
  $('extra-white').textContent = config.white.extra ?? '';
  $('extra-black').textContent = config.black.extra ?? '';

  const match = new Match({
    boardView,
    white: config.white,
    black: config.black,
    fen: config.fen,
    allowedMoves: config.allowedMoves,
    onMessage: (msg) => showBanner(msg),
    onTurn: (color, player) => {
      const pill = $('turn-pill');
      pill.textContent = color === 'w' ? `Trait aux Blancs — ${config.white.name}` : `Trait aux Noirs — ${config.black.name}`;
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
  });
}

// ---------------------------------------------------------------------------
// Boutons de l'écran de partie
// ---------------------------------------------------------------------------
$('btn-resign').addEventListener('click', () => {
  if (!currentMatch || currentMatch.finished) return;
  currentMatch.resign(currentMatch.engine.turn());
});
$('btn-quit-match').addEventListener('click', () => quitToMenu());

// ---------------------------------------------------------------------------
// Menu principal
// ---------------------------------------------------------------------------
$('btn-local').addEventListener('click', () => startLocalMatch());

showScreen('screen-menu');

// Petit crochet de débogage / tests automatisés (sans effet en jeu normal).
window.__dq = {
  boardView,
  get match() { return currentMatch; },
  startMatch,
};
