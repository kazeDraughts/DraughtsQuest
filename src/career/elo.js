/**
 * Classement Elo : la force du joueur (et celle, effective, des adversaires)
 * évolue avec les résultats.
 */

/** Score attendu du joueur A contre B (formule Elo classique). */
export function expectedScore(a, b) {
  return 1 / (1 + 10 ** ((b - a) / 400));
}

/**
 * Nouveau classement après une partie.
 * @param {number} rating   classement actuel
 * @param {number} oppRating classement de l'adversaire
 * @param {number} score    1 victoire, 0.5 nulle, 0 défaite
 * @param {number} k        facteur K (32 : progression rapide)
 */
export function updateElo(rating, oppRating, score, k = 32) {
  return Math.round(rating + k * (score - expectedScore(rating, oppRating)));
}

/**
 * Convertit un Elo en configuration d'IA : plus l'adversaire est coté,
 * plus il calcule profond, longtemps, et sans bruit ni gaffe.
 */
export function eloToAiConfig(elo) {
  const t = Math.max(0, elo - 500);
  return {
    maxDepth: Math.max(1, Math.min(12, Math.round(t / 220) + 1)),
    timeMs: Math.max(200, Math.min(3200, Math.round(elo * 1.2))),
    noise: Math.max(0, Math.round(130 - t / 11)),
    blunder: Math.max(0, +(0.5 - t / 2200).toFixed(3)),
  };
}

/** Titre affiché selon le classement du joueur. */
export function eloTitle(elo) {
  if (elo < 800) return 'Débutant';
  if (elo < 1000) return 'Amateur';
  if (elo < 1200) return 'Joueur de club';
  if (elo < 1450) return 'Espoir régional';
  if (elo < 1700) return 'Maître régional';
  if (elo < 1950) return 'Maître national';
  return 'Élite mondiale';
}
