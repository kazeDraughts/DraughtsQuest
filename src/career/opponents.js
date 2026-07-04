/**
 * Adversaires de carrière et compétitions.
 *
 * Chaque adversaire a un Elo de base ; son Elo EFFECTIF monte quand on le bat
 * (il progresse aussi !), et sa configuration d'IA découle de cet Elo
 * (voir eloToAiConfig). Les compétitions sont des séries de rondes.
 */

import { eloToAiConfig } from './elo.js';

export const OPPONENTS = {
  grandpa: { id: 'grandpa', baseElo: 650, tier: 'village' },
  momo: { id: 'momo', baseElo: 850, tier: 'club' },
  lea: { id: 'lea', baseElo: 1000, tier: 'club' },
  karim: { id: 'karim', baseElo: 1150, tier: 'club' },
  rival1: { id: 'rival1', baseElo: 1350, tier: 'regional' },   // Bastien
  rival2: { id: 'rival2', baseElo: 1550, tier: 'national' },   // Mireille
  gigi: { id: 'gigi', baseElo: 1850, tier: 'national' },
  anke: { id: 'anke', baseElo: 1950, tier: 'world' },
  sergei: { id: 'sergei', baseElo: 2020, tier: 'world' },
  champion: { id: 'champion', baseElo: 2120, tier: 'world' },  // Viktor Roi
};

/** Elo effectif : l'adversaire se renforce un peu à chaque défaite contre toi. */
export function opponentElo(oppId, careerState) {
  const opp = OPPONENTS[oppId];
  const beaten = careerState.beaten[oppId] || 0;
  return opp.baseElo + beaten * 25;
}

/** Configuration d'IA d'un adversaire, selon son Elo effectif. */
export function opponentAiConfig(oppId, careerState) {
  return eloToAiConfig(opponentElo(oppId, careerState));
}

/**
 * Sparring au club : qui accepte de jouer contre toi ?
 * Momo joue avec tout le monde ; les plus forts attendent que tu fasses
 * tes preuves contre le précédent.
 */
export function sparringAvailable(oppId, careerState) {
  const b = careerState.beaten;
  switch (oppId) {
    case 'momo': return true;
    case 'lea': return (b.momo || 0) >= 1;
    case 'karim': return (b.lea || 0) >= 1;
    case 'gigi': return (b.karim || 0) >= 1;
    default: return false;
  }
}

// ---------------------------------------------------------------------------
// Compétitions par paliers
// ---------------------------------------------------------------------------
export const COMPETITIONS = [
  {
    id: 'club_open',
    name: 'Tournoi du club',
    icon: '🏅',
    desc: 'Trois rondes contre les membres du club d\'Otterlaws.',
    rounds: ['momo', 'lea', 'karim'],
    minElo: 850,
    requiresWin: null,
    rewardPoints: 250,
  },
  {
    id: 'regional',
    name: 'Championnat régional',
    icon: '🥉',
    desc: 'Les meilleurs joueurs de la région. Ça ne rigole plus.',
    rounds: ['karim', 'rival1', 'rival2'],
    minElo: 1100,
    requiresWin: 'club_open',
    rewardPoints: 500,
  },
  {
    id: 'national',
    name: 'Championnat national',
    icon: '🥈',
    desc: 'L\'élite du pays… et un certain grand maître en finale.',
    rounds: ['rival1', 'rival2', 'gigi'],
    minElo: 1400,
    requiresWin: 'regional',
    rewardPoints: 1000,
  },
  {
    id: 'world',
    name: 'Championnat du MONDE',
    icon: '🏆',
    desc: 'Le sommet absolu. Viktor Roi, champion en titre, t\'attend.',
    rounds: ['anke', 'sergei', 'champion'],
    minElo: 1700,
    requiresWin: 'national',
    rewardPoints: 2500,
  },
];

export function competitionById(id) {
  return COMPETITIONS.find((c) => c.id === id);
}

/** Statut d'une compétition pour le joueur : locked / open / won. */
export function competitionStatus(comp, careerState) {
  if (careerState.competitionsWon.includes(comp.id)) return 'won';
  if (comp.requiresWin && !careerState.competitionsWon.includes(comp.requiresWin)) return 'locked';
  if (careerState.elo < comp.minElo) return 'locked';
  return 'open';
}

/** Ce qu'il manque pour débloquer (texte d'aide). */
export function unlockHint(comp, careerState) {
  if (comp.requiresWin && !careerState.competitionsWon.includes(comp.requiresWin)) {
    const prev = competitionById(comp.requiresWin);
    return `Remporte d'abord : ${prev.name}`;
  }
  if (careerState.elo < comp.minElo) {
    return `Classement requis : ${comp.minElo} (actuel : ${careerState.elo})`;
  }
  return '';
}
