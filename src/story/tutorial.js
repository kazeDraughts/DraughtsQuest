/**
 * Tutoriel interactif : Papi Marcel enseigne les dames internationales
 * pas à pas, sur de vraies mini-positions jouées sur le damier.
 *
 * Chaque étape : une position (FEN), des explications, une contrainte sur les
 * coups autorisés, une suggestion surlignée, et un commentaire de réussite.
 * Le moteur de règles réel est utilisé : les prises obligatoires et la rafle
 * majoritaire sont VRAIMENT imposées, le joueur le constate par lui-même.
 */

import { RulesEngine } from '../engine/rules.js';

const STEPS = [
  {
    fen: 'W:W33:B5',
    intro: [
      { who: 'grandpa', text: 'Voilà le damier international : 100 cases, on ne joue que sur les sombres. Tes pions avancent en DIAGONALE, d\'une case, vers l\'avant.' },
      { who: 'grandpa', text: 'À toi ! Avance ton pion d\'une case, en diagonale.' },
    ],
    hint: { from: 33, to: 28 },
    success: [{ who: 'grandpa', text: 'Voilà, tout simplement ! Un pion ne recule jamais… sauf pour prendre. Justement…' }],
  },
  {
    fen: 'W:W33:B28,5',
    intro: [
      { who: 'grandpa', text: 'Un pion adverse est devant toi, avec une case libre juste derrière lui : la PRISE EST OBLIGATOIRE. On saute par-dessus et on le capture.' },
      { who: 'grandpa', text: 'Regarde : tu ne peux jouer AUCUN autre coup. Prends ce pion !' },
    ],
    hint: { from: 33, to: 22 },
    success: [{ who: 'grandpa', text: 'Et hop, un prisonnier ! Retiens bien : si tu peux prendre, tu DOIS prendre.' }],
  },
  {
    fen: 'W:W28:B33,5',
    intro: [
      { who: 'grandpa', text: 'Surprise : aux dames internationales, le pion prend aussi EN ARRIÈRE ! Ce pion noir derrière toi n\'est pas à l\'abri.' },
      { who: 'grandpa', text: 'Capture-le en sautant en arrière.' },
    ],
    hint: { from: 28, to: 39 },
    success: [{ who: 'grandpa', text: 'Parfait ! En avant pour avancer, mais dans les quatre directions pour capturer.' }],
  },
  {
    fen: 'W:W33:B28,17,5',
    intro: [
      { who: 'grandpa', text: 'Maintenant, la RAFLE : si après une prise tu peux encore prendre, tu continues, d\'un seul coup ! Deux pions t\'attendent…' },
      { who: 'grandpa', text: 'Enchaîne les deux prises d\'un seul mouvement.' },
    ],
    hint: { from: 33, to: 11 },
    success: [{ who: 'grandpa', text: 'Une rafle de deux ! Ça, c\'est du dégât. Mais attention, il y a une règle en plus…' }],
  },
  {
    fen: 'W:W33:B28,17,7,29',
    intro: [
      { who: 'grandpa', text: 'La RAFLE MAJORITAIRE : quand plusieurs prises sont possibles, tu dois choisir celle qui capture LE PLUS de pièces. C\'est la règle d\'or du 10x10.' },
      { who: 'grandpa', text: 'Ici, tu pourrais prendre un pion… mais une rafle de TROIS existe. Le jeu ne te laissera que celle-là. Trouve-la !' },
    ],
    hint: null, // à trouver soi-même !
    success: [{ who: 'grandpa', text: 'Magnifique, trois d\'un coup ! Tu vois : le damier t\'oblige à la prise maximale. Un vrai damiste calcule TOUJOURS la plus grande rafle.' }],
  },
  {
    fen: 'W:W7:B14',
    intro: [
      { who: 'grandpa', text: 'Quand un pion atteint la DERNIÈRE RANGÉE et s\'y arrête, il est couronné : il devient une DAME. Vas-y, ton pion touche au but !' },
    ],
    hint: { from: 7, to: 1 },
    success: [{ who: 'grandpa', text: 'Couronné ! La dame est la pièce la plus puissante du jeu. Regarde ce qu\'elle sait faire…' }],
  },
  {
    fen: 'W:WK46:B28,5',
    intro: [
      { who: 'grandpa', text: 'La DAME est VOLANTE : elle glisse sur toute la diagonale, aussi loin qu\'elle veut, en avant comme en arrière. Et elle capture à distance !' },
      { who: 'grandpa', text: 'Ce pion noir traîne sur ta grande diagonale… Capture-le avec ta dame.' },
    ],
    hint: { from: 46, to: 23 },
    success: [
      { who: 'grandpa', text: 'Et voilà le travail ! Tu connais maintenant toutes les règles : déplacement, prise obligatoire, rafle majoritaire, promotion et dame volante.' },
      { who: 'grandpa', text: 'La théorie, c\'est fait. Place à la pratique, gamin : une VRAIE partie, toi contre moi. Montre-moi ce que tu as dans le crâne !' },
    ],
  },
];

/** Signal d'annulation minimaliste (abandon du tutoriel en cours). */
export function makeSignal() {
  const s = {
    aborted: false,
    _subs: [],
    abort() {
      s.aborted = true;
      s._subs.forEach((f) => f());
    },
    onAbort(f) {
      s._subs.push(f);
    },
  };
  return s;
}

/**
 * Déroule le tutoriel sur le damier de l'écran de partie.
 * @param {object} p { boardView, dialogue, setStatus(text), signal }
 * @returns {Promise<boolean>} true si terminé, false si interrompu
 */
export async function runTutorial({ boardView, dialogue, setStatus, signal = makeSignal() }) {
  for (let i = 0; i < STEPS.length; i++) {
    const step = STEPS[i];
    if (signal.aborted) return false;
    setStatus(`Leçon ${i + 1} / ${STEPS.length}`);

    const engine = new RulesEngine(step.fen);
    boardView.setState(engine.getBoard(), { lastMove: null, hint: step.hint });
    await dialogue.play(step.intro);
    if (signal.aborted) return false;

    // Attendre que le joueur joue un coup légal de l'exercice.
    await new Promise((resolve) => {
      signal.onAbort(resolve);
      let selected = null;
      const refresh = () => {
        const moves = engine.getLegalMoves();
        boardView.setState(engine.getBoard(), {
          selected,
          targets: selected ? moves.filter((m) => m.from === selected).map((m) => ({ to: m.to, captures: m.captures })) : [],
          moveable: [...new Set(moves.map((m) => m.from))],
          hint: selected ? null : step.hint,
          lastMove: null,
        });
      };
      refresh();
      boardView.onTap = async (sq) => {
        if (signal.aborted) return resolve();
        const moves = engine.getLegalMoves();
        const target = selected && moves.find((m) => m.from === selected && m.to === sq);
        if (target) {
          boardView.onTap = null;
          const before = engine.getBoard();
          engine.applyMove(target);
          await boardView.animateMove(target, before, engine.getBoard());
          resolve();
        } else if (sq && moves.some((m) => m.from === sq)) {
          selected = sq;
          refresh();
        } else {
          selected = null;
          refresh();
        }
      };
    });
    boardView.onTap = null;
    if (signal.aborted) return false;

    await dialogue.play(step.success);
  }
  return !signal.aborted;
}
