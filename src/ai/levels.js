/**
 * Niveaux de difficulté nommés de l'IA.
 * Chaque niveau combine : profondeur maximale, budget temps, bruit d'évaluation
 * et probabilité de gaffe — du débutant très battable au grand maître.
 * `elo` est indicatif : il sert au classement de carrière (phase 5).
 */

export const AI_LEVELS = {
  debutant: {
    id: 'debutant', name: 'Débutant', icon: '🐣', elo: 600,
    maxDepth: 1, timeMs: 200, noise: 120, blunder: 0.45,
    desc: 'Découvre à peine le damier. Idéal pour apprendre.',
  },
  apprenti: {
    id: 'apprenti', name: 'Apprenti', icon: '🙂', elo: 850,
    maxDepth: 2, timeMs: 350, noise: 60, blunder: 0.18,
    desc: 'Voit les prises simples, rate les combinaisons.',
  },
  club: {
    id: 'club', name: 'Joueur de club', icon: '🎓', elo: 1150,
    maxDepth: 4, timeMs: 700, noise: 25, blunder: 0.05,
    desc: 'Solide. Punit les erreurs évidentes.',
  },
  regional: {
    id: 'regional', name: 'Champion régional', icon: '🥉', elo: 1450,
    maxDepth: 6, timeMs: 1200, noise: 10, blunder: 0,
    desc: 'Calcule plusieurs coups à l\'avance.',
  },
  national: {
    id: 'national', name: 'Maître national', icon: '🥈', elo: 1750,
    maxDepth: 8, timeMs: 2000, noise: 4, blunder: 0,
    desc: 'Très fort. Chaque coup compte.',
  },
  mondial: {
    id: 'mondial', name: 'Grand maître', icon: '🏆', elo: 2050,
    maxDepth: 12, timeMs: 3200, noise: 0, blunder: 0,
    desc: 'L\'élite mondiale. Bonne chance…',
  },
};

export const LEVEL_ORDER = ['debutant', 'apprenti', 'club', 'regional', 'national', 'mondial'];

export function levelById(id) {
  return AI_LEVELS[id] || AI_LEVELS.club;
}
