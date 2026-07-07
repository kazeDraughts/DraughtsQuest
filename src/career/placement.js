/**
 * LE TEST DE NIVEAU — au début d'une nouvelle aventure, un joueur qui
 * connaît déjà le jeu peut jouer jusqu'à trois parties de placement :
 * on monte d'un adversaire à chaque victoire, et le classement Elo de
 * départ découle du parcours. Une victoire au moins dispense du tutoriel
 * (Papi Marcel proposera directement son défi).
 *
 *   Partie 1 : Apprenti (850)          défaite -> 700   nulle -> 850
 *   Partie 2 : Joueur de club (1150)   défaite -> 1000  nulle -> 1100
 *   Partie 3 : Champion régional (1450) défaite -> 1250 nulle -> 1400
 *   Trois victoires -> 1550.
 */

export const PLACEMENT_STEPS = ['apprenti', 'club', 'regional'];

const TABLE = [
  { lose: 700, draw: 850, winFinal: null },   // après la partie 1
  { lose: 1000, draw: 1100, winFinal: null }, // après la partie 2
  { lose: 1250, draw: 1400, winFinal: 1550 }, // après la partie 3
];

/**
 * Résultat d'une partie de placement.
 * @param {number} step 0..2 — index de la partie jouée
 * @param {'win'|'draw'|'lose'} outcome
 * @returns {{done: boolean, elo?: number, nextStep?: number}}
 */
export function placementResult(step, outcome) {
  const row = TABLE[step];
  if (outcome === 'win') {
    if (step < PLACEMENT_STEPS.length - 1) return { done: false, nextStep: step + 1 };
    return { done: true, elo: row.winFinal };
  }
  return { done: true, elo: outcome === 'draw' ? row.draw : row.lose };
}

/** Une victoire au moins (Elo >= 850 hors nulle d'entrée) saute le tutoriel. */
export function placementSkipsTutorial(elo, wins) {
  return wins >= 1 || elo >= 1000;
}
