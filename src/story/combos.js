/**
 * Les « donneurs d'énigmes » : trois PNJ proposent des séries de
 * combinaisons à CHERCHER (sans leçon) — le cœur du jeu de dames.
 *
 *   fernand   (étang du hameau)  : coups de deux — sacrifice, reprise, gain.
 *   honore    (place d'Otterlaws): grandes combinaisons — rafles profondes.
 *   seraphine (ruelle d'Otterlaws): passages à dame — percées par sacrifice.
 *
 * Chaque énigme de la banque est GÉNÉRÉE ET CERTIFIÉE par le moteur
 * (voir tests/combos.test.mjs) : le premier coup gagnant est UNIQUE,
 * chaque réplique noire est FORCÉE, et la position finale est gagnante
 * sans échappatoire (pas de pion passé, matériel net, évaluation profonde).
 *
 * record = { fen, line: [{ w:{from,to,takes}, b?:{from,to,takes} }, …] }
 * La ligne alterne coups blancs (à trouver) et répliques noires (scriptées).
 */

// ---------------------------------------------------------------------------
// La banque de combinaisons certifiées
// ---------------------------------------------------------------------------
export const COMBO_BANK = {
  fernand: [
    { fen: 'W:W24,25,33,37:B10,12,15,29',
      line: [{ w: { from: 33, to: 28, takes: 0 }, b: { from: 29, to: 20, takes: 1 } }, { w: { from: 25, to: 5, takes: 2 } }] },
    { fen: 'W:W26,30,34,40:B4,14,20,28',
      line: [{ w: { from: 30, to: 24, takes: 0 }, b: { from: 20, to: 29, takes: 1 } }, { w: { from: 34, to: 32, takes: 2 } }] },
    { fen: 'W:W27,29,34,40:B9,11,18,20',
      line: [{ w: { from: 29, to: 24, takes: 0 }, b: { from: 20, to: 29, takes: 1 } }, { w: { from: 34, to: 12, takes: 2 } }] },
    { fen: 'W:W27,28,30,40:B8,19,23,25',
      line: [{ w: { from: 30, to: 24, takes: 0 }, b: { from: 23, to: 21, takes: 2 } }, { w: { from: 24, to: 2, takes: 2 } }] },
    { fen: 'W:W27,29,31,44:B16,19,26,28',
      line: [{ w: { from: 29, to: 23, takes: 0 }, b: { from: 26, to: 37, takes: 1 } }, { w: { from: 23, to: 41, takes: 2 } }] },
    { fen: 'W:W28,30,39,43,44:B4,7,18,25,29',
      line: [{ w: { from: 28, to: 23, takes: 0 }, b: { from: 25, to: 34, takes: 1 } }, { w: { from: 23, to: 1, takes: 2 } }] },
  ],
  honore: [
    { fen: 'W:W25,28,30,47:B8,9,13,29',
      line: [{ w: { from: 30, to: 24, takes: 0 }, b: { from: 29, to: 20, takes: 1 } }, { w: { from: 25, to: 12, takes: 3 } }] },
    { fen: 'W:W28,32,37,47:B4,17,29,30',
      line: [{ w: { from: 28, to: 22, takes: 0 }, b: { from: 17, to: 28, takes: 1 } }, { w: { from: 32, to: 25, takes: 3 } }] },
    { fen: 'W:W30,44,45,46:B13,21,23,25',
      line: [{ w: { from: 44, to: 40, takes: 0 }, b: { from: 25, to: 34, takes: 1 } }, { w: { from: 40, to: 9, takes: 3 } }] },
    { fen: 'W:W27,29,32,37:B10,16,17,19',
      line: [{ w: { from: 27, to: 22, takes: 0 }, b: { from: 17, to: 28, takes: 1 } }, { w: { from: 32, to: 5, takes: 3 } }] },
    { fen: 'W:W24,28,29,30,42:B11,12,13,14,25',
      line: [{ w: { from: 24, to: 20, takes: 0 }, b: { from: 25, to: 32, takes: 3 } }, { w: { from: 20, to: 16, takes: 4 } }] },
    { fen: 'W:W26,29,30,35,46:B5,10,19,20,25',
      line: [{ w: { from: 30, to: 24, takes: 0 }, b: { from: 19, to: 30, takes: 1 } }, { w: { from: 35, to: 4, takes: 3 } }] },
  ],
  seraphine: [
    { fen: 'W:W6,11,24:B1,15,16',
      line: [{ w: { from: 11, to: 7, takes: 0 }, b: { from: 1, to: 12, takes: 1 } }, { w: { from: 6, to: 1, takes: 0 } }] },
    { fen: 'W:W6,14,25:B3,5,20',
      line: [{ w: { from: 14, to: 10, takes: 0 }, b: { from: 5, to: 14, takes: 1 } }, { w: { from: 6, to: 1, takes: 0 } }] },
    { fen: 'W:W6,11,22:B1,13,14',
      line: [{ w: { from: 11, to: 7, takes: 0 }, b: { from: 1, to: 12, takes: 1 } }, { w: { from: 6, to: 1, takes: 0 } }] },
    { fen: 'W:W11,20,22:B12,13,17',
      line: [{ w: { from: 11, to: 6, takes: 0 }, b: { from: 17, to: 28, takes: 1 } }, { w: { from: 6, to: 1, takes: 0 } }] },
    { fen: 'W:W11,14,20:B4,12,15',
      line: [{ w: { from: 14, to: 10, takes: 0 }, b: { from: 15, to: 24, takes: 1 } }, { w: { from: 10, to: 5, takes: 0 } }] },
    { fen: 'W:W7,11,21:B1,14,19',
      line: [{ w: { from: 11, to: 6, takes: 0 }, b: { from: 1, to: 12, takes: 1 } }, { w: { from: 6, to: 1, takes: 0 } }] },
  ],
};

export const COMBO_SERIES = [
  {
    id: 'fernand',
    npc: 'fernand',
    title: 'Les appâts de Fernand',
    icon: '🎣',
    reward: 40,
    // Ce que la série complète débloque (affiché et appliqué par main.js)
    unlock: { kind: 'board', theme: 'riverside', label: 'Damier « Au bord de l\'eau »' },
    requires: null,
    tagline: 'Offre un pion… et ferre deux poissons.',
  },
  {
    id: 'honore',
    npc: 'honore',
    title: 'Les grands coups d\'Honoré',
    icon: '🎩',
    reward: 60,
    unlock: { kind: 'pieces', theme: 'heritage', label: 'Pions « Héritage doré »' },
    requires: 'fernand',
    tagline: 'Des combinaisons profondes, comme au bon vieux temps.',
  },
  {
    id: 'seraphine',
    npc: 'seraphine',
    title: 'Les percées de Séraphine',
    icon: '🌙',
    reward: 80,
    unlock: { kind: 'flag', flag: 'ermite_revealed', label: 'Un maître caché se montre…' },
    requires: 'honore',
    tagline: 'Chaque énigme mène à la couronne.',
  },
];

export function comboSeriesById(id) {
  return COMBO_SERIES.find((s) => s.id === id);
}

/** Nombre d'énigmes résolues chez un PNJ. */
export function combosSolved(state, seriesId) {
  return state.training?.combos?.[seriesId] || 0;
}

/** La série de ce PNJ est-elle entièrement résolue ? */
export function comboSeriesDone(state, seriesId) {
  return combosSolved(state, seriesId) >= COMBO_BANK[seriesId].length;
}

/** Une série est accessible si la précédente de la chaîne est terminée. */
export function comboSeriesAvailable(state, seriesId) {
  const s = comboSeriesById(seriesId);
  if (!s) return false;
  return !s.requires || comboSeriesDone(state, s.requires);
}

// ---------------------------------------------------------------------------
// Adaptation d'un enregistrement de la banque au format runExercise
// ---------------------------------------------------------------------------
const fmt = (m) => `${m.from}${m.takes ? 'x' : '-'}${m.to}`;

/** Répliques d'ambiance, par PNJ, pour habiller les énigmes. */
const VOICE = {
  fernand: {
    search: (n, total) => [
      { who: 'fernand', text: `Énigme ${n}/${total}. Les Blancs jouent et GAGNENT. Comme à la pêche : trouve le bon appât, lance… et ça mord tout seul.` },
      { who: 'fernand', text: 'Cherche le coup qui FORCE tout : s\'ils peuvent prendre, ils doivent prendre.' },
    ],
    follow: [{ who: 'fernand', text: 'Ça a mordu ! Maintenant, remonte la ligne — la suite est forcée.' }],
    wrong: { who: 'fernand', text: 'Non… là, le poisson te regarde et s\'en va. Reprends : quel coup les OBLIGE à prendre ?' },
    solved: [{ who: 'fernand', text: 'Et hop, dans l\'épuisette ! Une vraie combinaison : tout était forcé du début à la fin.' }],
  },
  honore: {
    search: (n, total) => [
      { who: 'honore', text: `Énigme ${n}/${total}. Les Blancs jouent et gagnent — et pas d'un demi-pion, crois-moi. Dans mon temps, on appelait ça un GRAND coup.` },
      { who: 'honore', text: 'Regarde loin : le premier coup semble donner… c\'est la rafle d\'après qui ramasse tout.' },
    ],
    follow: [{ who: 'honore', text: 'Voilà. Et maintenant, le damier te doit de l\'argent : encaisse.' }],
    wrong: { who: 'honore', text: 'Hum. Joli coup de promeneur, mais rien n\'est forcé. Cherche le sacrifice qui déclenche TOUT.' },
    solved: [{ who: 'honore', text: 'Ah ! Ça, c\'est un coup à raconter au café. Les grandes combinaisons ne meurent jamais.' }],
  },
  seraphine: {
    search: (n, total) => [
      { who: 'seraphine', text: `Énigme ${n}/${total}. Les Blancs jouent… et couronnent. La porte est fermée, mais chaque serrure a sa clé.` },
      { who: 'seraphine', text: 'Offre ce qu\'il faut offrir : c\'est la prise adverse qui t\'ouvrira le chemin de la dame.' },
    ],
    follow: [{ who: 'seraphine', text: 'La porte s\'entrouvre… Termine : la couronne t\'attend.' }],
    wrong: { who: 'seraphine', text: 'Non. Par là, le chemin reste fermé. Le bon coup SACRIFIE — et la reprise forcée dégage ta diagonale.' },
    solved: [{ who: 'seraphine', text: 'Couronnée… Tu vois : il suffisait de donner pour recevoir.' }],
  },
};

/**
 * Construit un exercice jouable (format runExercise de training.js)
 * à partir d'un enregistrement de la banque.
 */
export function comboToExercise(seriesId, index) {
  const series = comboSeriesById(seriesId);
  const rec = COMBO_BANK[seriesId][index];
  if (!series || !rec) return null;
  const voice = VOICE[seriesId];
  const total = COMBO_BANK[seriesId].length;

  const steps = rec.line.map((step, i) => ({
    fen: i === 0 ? rec.fen : undefined,
    intro: i === 0 ? voice.search(index + 1, total) : voice.follow,
    accept: [{ from: step.w.from, to: step.w.to }],
    reply: step.b ? { from: step.b.from, to: step.b.to } : undefined,
    wrong: voice.wrong,
    success: i === rec.line.length - 1
      ? [...voice.solved, { who: series.npc, text: `La solution complète : ${rec.line.map((s) => fmt(s.w) + (s.b ? ` (${fmt(s.b)})` : '')).join(', ')}.` }]
      : undefined,
    // L'indice n'apparaît qu'après 2 échecs (géré par runExercise)
    hint: { from: step.w.from, to: step.w.to },
  }));

  return {
    id: `combo_${seriesId}_${index}`,
    title: `${series.icon} ${series.title} — ${index + 1}/${total}`,
    reward: series.reward,
    steps,
  };
}
