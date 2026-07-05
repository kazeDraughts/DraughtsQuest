/**
 * Cartes du monde de DraughtsQuest.
 *
 * Tuiles : '.' herbe  ','herbe sombre  'f' fleurs  'p' chemin  's' sable
 *          't' arbre(solide)  'w' eau(solide)  'r' rocher(solide)
 *          'W' mur intérieur(solide)  'F' plancher  'c' tapis  'x' vide(solide)
 *
 * Chaque carte : grid, spawn, props (bâtiments/meubles, avec collisions),
 * doors (tuiles de passage), exits (bords de carte), npcs, interactables.
 */

// ---- petites aides de construction de grilles ----
function grid(w, h, fill) {
  return Array.from({ length: h }, () => Array.from({ length: w }, () => fill));
}
function set(g, x, y, c) {
  if (g[y] && g[y][x] !== undefined) g[y][x] = c;
}
function rect(g, x1, y1, x2, y2, c) {
  for (let y = y1; y <= y2; y++) for (let x = x1; x <= x2; x++) set(g, x, y, c);
}
function border(g, c) {
  rect(g, 0, 0, g[0].length - 1, 0, c);
  rect(g, 0, g.length - 1, g[0].length - 1, g.length - 1, c);
  rect(g, 0, 0, 0, g.length - 1, c);
  rect(g, g[0].length - 1, 0, g[0].length - 1, g.length - 1, c);
}
function sprinkle(g, cells, c) {
  for (const [x, y] of cells) set(g, x, y, c);
}
const toStrings = (g) => g.map((row) => row.join(''));

// ---------------------------------------------------------------------------
// VILLAGE (extérieur) — la maison de Tim et celle de Papi Marcel
// ---------------------------------------------------------------------------
function buildVillage() {
  const g = grid(22, 16, '.');
  border(g, 't');
  rect(g, 10, 0, 11, 15, 'p');            // chemin principal nord-sud
  rect(g, 5, 12, 10, 12, 'p');            // allée vers la maison de Tim
  rect(g, 5, 11, 5, 12, 'p');
  rect(g, 12, 6, 16, 6, 'p');             // allée vers la maison de Papi
  rect(g, 16, 5, 16, 6, 'p');
  rect(g, 17, 8, 20, 10, 'w');            // étang
  rect(g, 17, 8, 17, 10, 'w');
  sprinkle(g, [[4, 3], [7, 7], [3, 6], [15, 12], [18, 13], [2, 12], [8, 4], [13, 13]], 't');
  sprinkle(g, [[3, 4], [6, 8], [14, 11], [12, 2], [19, 6], [4, 13], [15, 8]], 'f');
  sprinkle(g, [[2, 8], [13, 3], [17, 12], [7, 13]], ',');
  set(g, 10, 0, 'p'); set(g, 11, 0, 'p'); // ouverture vers la ville

  return {
    id: 'village', name: 'Hameau de Prunelle', outdoor: true,
    grid: toStrings(g),
    spawn: { x: 6, y: 13 },
    props: [
      { type: 'house', x: 3, y: 9, w: 4, h: 3, palette: { body: '#c8a06a', roof: '#b0523c' }, doorX: 5, label: 'Chez Tim' },
      { type: 'house', x: 14, y: 2, w: 4, h: 3, palette: { body: '#b6b09a', roof: '#5f7a52' }, doorX: 16, label: 'Chez Papi Marcel' },
      { type: 'sign', x: 12, y: 1, text: 'Ville d\'Otterlaws ↑' },
    ],
    doors: [
      { x: 5, y: 11, target: { map: 'home', x: 4.5, y: 6.2, dir: 'up' } },
      { x: 16, y: 4, target: { map: 'grandpa', x: 4.5, y: 6.2, dir: 'up' } },
    ],
    exits: [
      { x1: 9.5, y1: -0.5, x2: 12.5, y2: 0.6, target: { map: 'town', x: 10.5, y: 14, dir: 'up' } },
    ],
    npcs: [
      { id: 'villager1', x: 13, y: 10, dir: 'left', wander: 1.5 },
    ],
    interactables: [],
  };
}

// ---------------------------------------------------------------------------
// OTTERLAWS (extérieur) — la ville : club et boutique
// ---------------------------------------------------------------------------
function buildTown() {
  const g = grid(22, 16, '.');
  border(g, 't');
  rect(g, 10, 1, 11, 15, 'p');            // axe nord-sud (entrée au sud)
  rect(g, 3, 8, 18, 9, 'p');              // grande rue
  rect(g, 6, 5, 6, 8, 'p');               // allée du club
  rect(g, 16, 6, 16, 8, 'p');             // allée de la boutique
  rect(g, 9, 11, 12, 12, 's');            // place de la fontaine
  sprinkle(g, [[2, 2], [19, 2], [2, 13], [19, 13], [14, 2], [4, 12]], 't');
  sprinkle(g, [[8, 3], [13, 5], [18, 11], [3, 10], [7, 12], [15, 11]], 'f');
  set(g, 10, 15, 'p'); set(g, 11, 15, 'p'); // ouverture vers le village

  return {
    id: 'town', name: 'Otterlaws', outdoor: true,
    grid: toStrings(g),
    spawn: { x: 10.5, y: 13 },
    props: [
      { type: 'house', x: 3, y: 2, w: 7, h: 3, palette: { body: '#8a94b8', roof: '#3c4668' }, doorX: 6, label: 'Club de Dames d\'Otterlaws', big: true },
      { type: 'house', x: 14, y: 3, w: 5, h: 3, palette: { body: '#c89a78', roof: '#8a4668' }, doorX: 16, label: 'Boutique de Mme Plot' },
      { type: 'fountain', x: 10, y: 11, w: 2, h: 2 },
      { type: 'sign', x: 12, y: 13, text: '↓ Hameau de Prunelle' },
    ],
    doors: [
      { x: 6, y: 4, target: { map: 'club', x: 8, y: 9.2, dir: 'up' }, lockFlag: 'club_unlocked', lockedMessage: 'Le club est réservé aux inscrits. Un grand joueur pourrait t\'y introduire…' },
      { x: 16, y: 5, target: { map: 'shop', x: 5, y: 6.2, dir: 'up' } },
    ],
    exits: [
      { x1: 9.5, y1: 15.4, x2: 12.5, y2: 16.5, target: { map: 'village', x: 10.5, y: 1.5, dir: 'down' } },
    ],
    npcs: [
      { id: 'villager2', x: 13, y: 11.5, dir: 'left', wander: 1.2 },
    ],
    interactables: [],
  };
}

// ---------------------------------------------------------------------------
// Intérieurs
// ---------------------------------------------------------------------------
function interior(w, h) {
  const g = grid(w, h, 'F');
  border(g, 'W');
  return g;
}

function buildHome() {
  const g = interior(10, 8);
  rect(g, 3, 3, 6, 4, 'c');
  set(g, 4, 7, 'F'); set(g, 5, 7, 'F'); // seuil
  return {
    id: 'home', name: 'La maison de Tim', outdoor: false,
    grid: toStrings(g),
    spawn: { x: 4.5, y: 5.5 },
    props: [
      { type: 'bed', x: 1, y: 1, w: 1, h: 2 },
      { type: 'shelf', x: 3, y: 1, w: 2, h: 1 },
      { type: 'table', x: 6, y: 4, w: 2, h: 1 },
      { type: 'plant', x: 8, y: 1, w: 1, h: 1 },
      { type: 'mat', x: 4, y: 6.6, w: 2, h: 1 },
    ],
    doors: [
      { x: 4, y: 7, target: { map: 'village', x: 5.5, y: 12.2, dir: 'down' } },
      { x: 5, y: 7, target: { map: 'village', x: 5.5, y: 12.2, dir: 'down' } },
    ],
    exits: [],
    npcs: [
      { id: 'mom', x: 6.5, y: 3, dir: 'down' },
    ],
    interactables: [],
  };
}

function buildGrandpa() {
  const g = interior(10, 8);
  rect(g, 2, 2, 7, 5, 'c');
  set(g, 4, 7, 'F'); set(g, 5, 7, 'F');
  return {
    id: 'grandpa', name: 'Chez Papi Marcel', outdoor: false,
    grid: toStrings(g),
    spawn: { x: 4.5, y: 5.5 },
    props: [
      { type: 'shelf', x: 1, y: 1, w: 3, h: 1 },
      { type: 'boardtable', x: 4, y: 3, w: 2, h: 1 },
      { type: 'plant', x: 8, y: 1, w: 1, h: 1 },
      { type: 'bed', x: 8, y: 4, w: 1, h: 2 },
      { type: 'mat', x: 4, y: 6.6, w: 2, h: 1 },
    ],
    doors: [
      { x: 4, y: 7, target: { map: 'village', x: 16.5, y: 5.2, dir: 'down' } },
      { x: 5, y: 7, target: { map: 'village', x: 16.5, y: 5.2, dir: 'down' } },
    ],
    exits: [],
    npcs: [
      { id: 'grandpa', x: 5.5, y: 2.6, dir: 'down' },
    ],
    interactables: [
      { id: 'grandpa_board', type: 'boardhint', x: 4, y: 3, w: 2, h: 1, action: 'grandpa_board' },
    ],
  };
}

function buildClub() {
  const g = interior(16, 11);
  rect(g, 2, 2, 13, 8, 'c');
  set(g, 7, 10, 'F'); set(g, 8, 10, 'F');
  return {
    id: 'club', name: 'Club de Dames d\'Otterlaws', outdoor: false,
    grid: toStrings(g),
    spawn: { x: 8, y: 8.5 },
    props: [
      { type: 'boardtable', x: 3, y: 3, w: 2, h: 1 },
      { type: 'boardtable', x: 11, y: 3, w: 2, h: 1 },
      { type: 'boardtable', x: 3, y: 6, w: 2, h: 1, label: '🎓 Entraînement' },
      { type: 'boardtable', x: 11, y: 6, w: 2, h: 1 },
      { type: 'trophy', x: 7, y: 1, w: 2, h: 1 },
      { type: 'noticeboard', x: 12, y: 1, w: 2, h: 1, label: '🏆 Compétitions' },
      { type: 'plant', x: 1, y: 1, w: 1, h: 1 },
      { type: 'plant', x: 14, y: 1, w: 1, h: 1 },
      { type: 'mat', x: 7, y: 9.6, w: 2, h: 1 },
    ],
    doors: [
      { x: 7, y: 10, target: { map: 'town', x: 6.5, y: 5.2, dir: 'down' } },
      { x: 8, y: 10, target: { map: 'town', x: 6.5, y: 5.2, dir: 'down' } },
    ],
    exits: [],
    npcs: [
      { id: 'gigi', x: 8, y: 2.6, dir: 'down' },
      { id: 'momo', x: 4, y: 4.4, dir: 'right', wander: 0.8 },
      { id: 'lea', x: 12, y: 4.4, dir: 'left', wander: 0.8 },
      { id: 'karim', x: 4, y: 7.4, dir: 'right' },
      { id: 'arbiter', x: 12, y: 7.4, dir: 'left' },
    ],
    interactables: [
      { id: 'club_notice', type: 'noticehint', x: 12, y: 1, w: 2, h: 1, action: 'competitions' },
      { id: 'club_training', type: 'boardhint', x: 3, y: 6, w: 2, h: 1, action: 'training' },
    ],
  };
}

function buildShop() {
  const g = interior(10, 8);
  rect(g, 2, 4, 7, 5, 'c');
  set(g, 4, 7, 'F'); set(g, 5, 7, 'F');
  return {
    id: 'shop', name: 'Boutique de Mme Plot', outdoor: false,
    grid: toStrings(g),
    spawn: { x: 5, y: 5.5 },
    props: [
      { type: 'counter', x: 2, y: 2, w: 6, h: 1 },
      { type: 'shelf', x: 1, y: 1, w: 2, h: 1 },
      { type: 'shelf', x: 7, y: 1, w: 2, h: 1 },
      { type: 'plant', x: 8, y: 5, w: 1, h: 1 },
      { type: 'mat', x: 4, y: 6.6, w: 2, h: 1 },
    ],
    doors: [
      { x: 4, y: 7, target: { map: 'town', x: 16.5, y: 6.2, dir: 'down' } },
      { x: 5, y: 7, target: { map: 'town', x: 16.5, y: 6.2, dir: 'down' } },
    ],
    exits: [],
    npcs: [
      { id: 'shopkeeper', x: 4.5, y: 1.8, dir: 'down' },
    ],
    interactables: [],
  };
}

export const MAPS = {
  village: buildVillage(),
  town: buildTown(),
  home: buildHome(),
  grandpa: buildGrandpa(),
  club: buildClub(),
  shop: buildShop(),
};

/** Personnalise les libellés qui portent le prénom du héros/de l'héroïne. */
export function setPlayerHomeName(name) {
  MAPS.home.name = `La maison de ${name}`;
  const house = MAPS.village.props.find((p) => p.type === 'house' && p.doorX === 5);
  if (house) house.label = `Chez ${name}`;
}

/** Tuiles solides (infranchissables). */
export const SOLID_TILES = new Set(['t', 'w', 'r', 'W', 'x']);
