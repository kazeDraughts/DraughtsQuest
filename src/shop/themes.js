/**
 * Catalogue des cosmétiques : DAMIERS et PIONS.
 * - Chaque entrée a un id, un nom, un prix (en Pions d'Or) et des paramètres
 *   de rendu consommés par BoardView.
 * - price: 0 => possédé dès le départ.
 * Le catalogue sert à la fois à la boutique (phase 6) et au rendu (phase 1).
 */

export const BOARD_THEMES = [
  {
    id: 'classic',
    name: 'Classique',
    desc: 'Le damier officiel des clubs.',
    price: 0,
    light: '#ecd9b4', dark: '#7a5230', border: '#4d3319',
    coord: 'rgba(255,255,255,.55)', table: '#2e2419',
  },
  {
    id: 'wood',
    name: 'Bois précieux',
    desc: 'Noyer et érable vernis.',
    price: 150,
    light: '#e8c48a', dark: '#8a4b21', border: '#5b2f12',
    coord: 'rgba(255,244,214,.6)', table: '#3a2412', grain: true,
  },
  {
    id: 'marble',
    name: 'Marbre',
    desc: 'Élégance de palais italien.',
    price: 300,
    light: '#e9e6e1', dark: '#5d6670', border: '#3c434b',
    coord: 'rgba(255,255,255,.5)', table: '#23272d', veins: true,
  },
  {
    id: 'neon',
    name: 'Néon',
    desc: 'Ambiance arcade rétro-future.',
    price: 500,
    light: '#12142b', dark: '#1f2350', border: '#0a0b1a',
    coord: 'rgba(0,229,255,.7)', table: '#05060f',
    glow: '#00e5ff', gridGlow: true,
  },
  {
    id: 'space',
    name: 'Spatial',
    desc: 'Jouez au milieu des étoiles.',
    price: 750,
    light: '#1b2440', dark: '#0d1226', border: '#060916',
    coord: 'rgba(180,200,255,.6)', table: '#03040a', stars: true,
  },
  {
    id: 'candy',
    name: 'Bonbon',
    desc: 'Sucré, acidulé, interdit aux diabétiques.',
    price: 400,
    light: '#ffe3f1', dark: '#ff9ec6', border: '#e0559b',
    coord: 'rgba(120,30,80,.55)', table: '#8e2f63', candy: true,
  },
  {
    id: 'ardoise',
    name: 'L\'Ardoise du professeur',
    desc: 'Le damier d\'étude de l\'Académie, à la craie.',
    secret: 'Récompense : le diplôme de l\'Académie du Damier (les 5 leçons de style).',
    price: 0,
    light: '#3f5347', dark: '#2b3a31', border: '#1d2822',
    coord: 'rgba(240,240,225,.75)', table: '#15201a', gridGlow: true, glow: '#e8e6d4',
  },
  {
    id: 'riverside',
    name: 'Au bord de l\'eau',
    desc: 'Le damier fétiche de Fernand. Introuvable en boutique.',
    secret: 'Récompense : les énigmes de Fernand (étang du hameau).',
    price: 0,
    light: '#dcebc8', dark: '#4f7d6a', border: '#2e4a3e',
    coord: 'rgba(240,255,240,.6)', table: '#243830', veins: true,
  },
];

export const PIECE_THEMES = [
  {
    id: 'classic',
    name: 'Classiques',
    desc: 'Pions de tournoi en buis et ébène.',
    price: 0,
    shape: 'disc',
    w: { fill: '#f5efdf', edge: '#c9bb96', line: '#8a7c57' },
    b: { fill: '#3b3630', edge: '#191613', line: '#6b6157' },
  },
  {
    id: 'marbles',
    name: 'Billes',
    desc: 'Des billes de verre brillantes.',
    price: 150,
    shape: 'ball',
    w: { fill: '#dff3ff', edge: '#7fc4e8', line: '#3d84ab' },
    b: { fill: '#37476b', edge: '#131c33', line: '#7d90c0' },
  },
  {
    id: 'gems',
    name: 'Gemmes',
    desc: 'Diamants et rubis taillés.',
    price: 350,
    shape: 'gem',
    w: { fill: '#eafcf9', edge: '#67d7c4', line: '#2e9c8a' },
    b: { fill: '#8e2440', edge: '#4e0f21', line: '#e06a8a' },
  },
  {
    id: 'neon',
    name: 'Néon',
    desc: 'Anneaux lumineux du cyber-espace.',
    price: 500,
    shape: 'ring',
    w: { fill: '#0ff2ff', edge: '#00b3c8', line: '#e6ffff', glow: '#00e5ff' },
    b: { fill: '#ff3df0', edge: '#b800a8', line: '#ffd8fb', glow: '#ff3df0' },
  },
  {
    id: 'ghosts',
    name: 'Fantômes',
    desc: 'Bouh ! Des pions venus d\'ailleurs.',
    price: 600,
    shape: 'ghost',
    w: { fill: '#f2f6ff', edge: '#b9c6e8', line: '#5b6b96' },
    b: { fill: '#584a75', edge: '#2e2442', line: '#b8a7e0' },
  },
  {
    id: 'donuts',
    name: 'Donuts',
    desc: 'Interdiction formelle de les manger.',
    price: 450,
    shape: 'donut',
    w: { fill: '#f7c873', edge: '#c98f3d', line: '#fff0f5', icing: '#ff9ec6' },
    b: { fill: '#7a4a21', edge: '#4a2a10', line: '#fff0f5', icing: '#8ee08e' },
  },
  {
    id: 'heritage',
    name: 'Héritage doré',
    desc: 'Les pions de collection d\'Honoré. Introuvables en boutique.',
    secret: 'Récompense : les grandes combinaisons d\'Honoré (place d\'Otterlaws).',
    price: 0,
    shape: 'disc',
    w: { fill: '#f6e2a8', edge: '#c9a23c', line: '#8a6a1c' },
    b: { fill: '#4a3a20', edge: '#241a0a', line: '#c9a23c' },
  },
];

export function boardThemeById(id) {
  return BOARD_THEMES.find((t) => t.id === id) || BOARD_THEMES[0];
}
export function pieceThemeById(id) {
  return PIECE_THEMES.find((t) => t.id === id) || PIECE_THEMES[0];
}
