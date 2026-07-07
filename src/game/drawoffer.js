/**
 * Proposition de NULLE : l'IA vérifie la position avant de répondre.
 *
 * Règles de décision :
 * - avant MIN_PLIES demi-coups, on ne parle pas de nulle (comme en club) ;
 * - l'IA accepte si elle n'est PAS nettement mieux — le seuil dépend de sa
 *   force : un grand maître ne lâche rien, un débutant est bon public ;
 * - si l'IA est moins bien ou perdante, elle accepte évidemment (c'est au
 *   joueur de ne pas offrir la nulle dans une position gagnante !).
 */

export const MIN_DRAW_PLIES = 30;   // demi-coups minimum avant une offre
export const DRAW_RETRY_PLIES = 10; // délai avant de pouvoir reproposer

/**
 * @param {object} p
 * @param {number} p.aiScore éval de la position du point de vue de l'IA (centipions)
 * @param {number} p.aiElo   force de l'IA
 * @param {number} p.plies   demi-coups joués dans la partie
 * @returns {{accept: boolean, reason?: 'early'|'winning'}}
 */
export function aiAcceptsDraw({ aiScore, aiElo = 1200, plies }) {
  if (plies < MIN_DRAW_PLIES) return { accept: false, reason: 'early' };
  const threshold = aiElo >= 1700 ? 25 : aiElo >= 1100 ? 60 : 100;
  if (aiScore > threshold) return { accept: false, reason: 'winning' };
  return { accept: true };
}
