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
    // — énigmes certifiées issues des recueils « Allons à dame » (J-F. Latapie / J-P. Dubois) —
    { fen: 'W:W31,36,37,45,48:B3,12,17,19,38', src: 'MdeM/Coup_royal',
      line: [{ w: { from: 37, to: 32, takes: 0 }, b: { from: 38, to: 27, takes: 1 } }, { w: { from: 31, to: 11, takes: 2 } }] },
    { fen: 'W:W27,31,36,45,48,49:B3,11,12,16,19,28', src: 'MdeM/Coup_royal',
      line: [{ w: { from: 27, to: 21, takes: 0 }, b: { from: 16, to: 27, takes: 1 } }, { w: { from: 31, to: 33, takes: 2 } }] },
    { fen: 'W:W32,35,37,38,41,42,48:B2,6,18,26,31,39', src: 'MdeM/classique1',
      line: [{ w: { from: 38, to: 33, takes: 0 }, b: { from: 39, to: 28, takes: 1 } }, { w: { from: 32, to: 12, takes: 2 } }] },
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
    // — énigmes certifiées issues des recueils « Allons à dame » (J-F. Latapie / J-P. Dubois) —
    { fen: 'W:W20,23,34:B10,29,38', src: 'MdeM/Coup_renverse',
      line: [{ w: { from: 20, to: 14, takes: 0 }, b: { from: 10, to: 28, takes: 2 } }, { w: { from: 34, to: 43, takes: 3 } }] },
    { fen: 'W:W33,37,38,39,40:B13,14,22,24,35', src: 'fic_combi/cu03',
      line: [{ w: { from: 33, to: 29, takes: 0 }, b: { from: 35, to: 31, takes: 4 } }, { w: { from: 29, to: 36, takes: 5 } }] },
    { fen: 'W:W21,27,30,34,37:B12,16,19,20,26,28', src: 'MdeM/TaquB24',
      line: [{ w: { from: 30, to: 25, takes: 0 }, b: { from: 26, to: 17, takes: 1 } }, { w: { from: 25, to: 32, takes: 3 } }] },
    { fen: 'W:W32,34,38,39,40,45:B12,13,14,23,24,29', src: 'MdeM/Coup_royal',
      line: [{ w: { from: 32, to: 28, takes: 0 }, b: { from: 23, to: 43, takes: 2 } }, { w: { from: 34, to: 23, takes: 1 }, b: { from: 43, to: 34, takes: 1 } }, { w: { from: 40, to: 7, takes: 5 } }] },
    { fen: 'W:W31,35,36,37,45,48:B7,8,10,17,19,23,38', src: 'MdeM/Coup_royal',
      line: [{ w: { from: 37, to: 32, takes: 0 }, b: { from: 38, to: 27, takes: 1 } }, { w: { from: 31, to: 24, takes: 5 } }] },
    { fen: 'W:W16,29,30,33,34,37,42:B6,18,19,20,22,28', src: 'MdeM/Coup_royal',
      line: [{ w: { from: 30, to: 25, takes: 0 }, b: { from: 28, to: 30, takes: 2 } }, { w: { from: 25, to: 12, takes: 3 } }] },
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
    // — énigmes certifiées issues des recueils « Allons à dame » (J-F. Latapie / J-P. Dubois) —
    { fen: 'W:W32,33,37,39:B9,18,23,26', src: 'fic_combi/cu02',
      line: [{ w: { from: 37, to: 31, takes: 0 }, b: { from: 26, to: 28, takes: 2 } }, { w: { from: 33, to: 4, takes: 3 } }] },
    { fen: 'W:W26,31,32,43:B9,17,19,38', src: 'fic_combi/cu01',
      line: [{ w: { from: 26, to: 21, takes: 0 }, b: { from: 17, to: 28, takes: 3 } }, { w: { from: 43, to: 3, takes: 4 } }] },
    { fen: 'W:W20,25,42,45,48:B3,4,9,10,17,19', src: 'MdeM/Coup_royal',
      line: [{ w: { from: 20, to: 14, takes: 0 }, b: { from: 9, to: 20, takes: 1 } }, { w: { from: 25, to: 5, takes: 2 } }] },
    { fen: 'W:W25,29,33,42,47:B9,12,15,21,22,38', src: 'MdeM/TaquN27',
      line: [{ w: { from: 29, to: 24, takes: 0 }, b: { from: 38, to: 20, takes: 2 } }, { w: { from: 25, to: 3, takes: 2 } }] },
    { fen: 'W:W24,25,33,38,45,47:B2,4,7,8,9,13,27', src: 'MdeM/classique1',
      line: [{ w: { from: 38, to: 32, takes: 0 }, b: { from: 27, to: 20, takes: 3 } }, { w: { from: 25, to: 1, takes: 4 } }] },
    { fen: 'W:W18,26,45,47,48,49:B3,7,12,17,19,27,38', src: 'MdeM/Coup_royal',
      line: [{ w: { from: 48, to: 43, takes: 0 }, b: { from: 12, to: 23, takes: 1 } }, { w: { from: 43, to: 1, takes: 4 } }] },
  ],
  hortense: [
    // Études de finales des cours « Allons à dame » : UN SEUL coup gagne
    // (certifié : le coup unique mène à une éval >= 250, les autres <= 60).
    { fen: 'W:W34,50:B33', src: 'fic_finsdepartie/nfu38',
      line: [{ w: { from: 34, to: 29, takes: 0 } }] },
    { fen: 'W:W7,26:B13,38', src: 'fic_finsdepartie/nfu37',
      line: [{ w: { from: 7, to: 2, takes: 0 } }] },
    { fen: 'W:WK6,32:B21,K50', src: 'fic_finsdepartie/nfu15',
      line: [{ w: { from: 32, to: 28, takes: 0 } }] },
    { fen: 'W:WK28,38:B6,45', src: 'fins_de_partie/fin100d',
      line: [{ w: { from: 28, to: 50, takes: 0 } }] },
    { fen: 'W:WK15,34:B25,37', src: 'fins_de_partie/fin100c',
      line: [{ w: { from: 15, to: 47, takes: 0 } }] },
    { fen: 'W:WK18,42:B33,39', src: 'fic_finsdepartie/nfu27',
      line: [{ w: { from: 18, to: 22, takes: 0 } }] },
    { fen: 'W:W34,K39:BK25,35', src: 'fic_finsdepartie/u39',
      line: [{ w: { from: 39, to: 48, takes: 0 } }] },
    { fen: 'W:WK10,35:B25,29,33', src: 'fic_finsdepartie/nfu22',
      line: [{ w: { from: 10, to: 15, takes: 0 } }] },
    { fen: 'W:W38,39,47:B28,42', src: 'fic_finsdepartie/nfu31',
      line: [{ w: { from: 39, to: 33, takes: 0 } }] },
    { fen: 'W:WK6,38:B22,23,K28', src: 'fins_de_partie/fin100d',
      line: [{ w: { from: 38, to: 32, takes: 0 } }] },
    { fen: 'W:W38,K42:B14,18,28,34', src: 'fins_de_partie/fin100c',
      line: [{ w: { from: 42, to: 48, takes: 0 } }] },
    { fen: 'W:W13,27,41:B3,11,16', src: 'fic_finsdepartie/nfu28',
      line: [{ w: { from: 41, to: 37, takes: 0 } }] },
  ],
};

export const COMBO_SERIES = [
  {
    id: 'fernand',
    npc: 'fernand',
    title: 'Les appâts de Fernand',
    icon: '🎣',
    reward: 40,
    core: 6, // les 6 premières énigmes suffisent au déblocage de la chaîne
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
    core: 6,
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
    core: 6,
    unlock: { kind: 'flag', flag: 'ermite_revealed', label: 'Un maître caché se montre…' },
    requires: 'honore',
    tagline: 'Chaque énigme mène à la couronne.',
  },
  {
    id: 'hortense',
    npc: 'hortense',
    kind: 'etude', // études de finales : UN SEUL coup gagne (pas de sacrifice imposé)
    title: 'Les études d\'Hortense',
    icon: '🕯️',
    reward: 60,
    unlock: { kind: 'pieces', theme: 'ivoire', label: 'Pions « Ivoire & ébène »' },
    requires: null, // proposé par Hortense après sa leçon (voir quests.js)
    tagline: 'Une position, un seul coup juste. Trouve-le.',
  },
];

export function comboSeriesByNpc(npcId) {
  return COMBO_SERIES.find((s) => s.npc === npcId);
}

export function comboSeriesById(id) {
  return COMBO_SERIES.find((s) => s.id === id);
}

/** Nombre d'énigmes résolues chez un PNJ. */
export function combosSolved(state, seriesId) {
  return state.training?.combos?.[seriesId] || 0;
}

/**
 * La série « de base » (les `core` premières énigmes) est-elle résolue ?
 * C'est elle qui déclenche la récompense et débloque la chaîne — les
 * énigmes suivantes (issues des recueils) sont du bonus.
 */
export function comboSeriesDone(state, seriesId) {
  const s = comboSeriesById(seriesId);
  return combosSolved(state, seriesId) >= (s?.core ?? COMBO_BANK[seriesId].length);
}

/** TOUTES les énigmes du PNJ (base + recueils) sont-elles résolues ? */
export function comboBankCleared(state, seriesId) {
  return combosSolved(state, seriesId) >= COMBO_BANK[seriesId].length;
}

/** Prime unique quand un joueur vide entièrement la réserve d'un PNJ. */
export const COMBO_CLEARED_BONUS = 150;

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
  hortense: {
    search: (n, total) => [
      { who: 'hortense', text: `Étude ${n}/${total}, ${'mon petit'}. Les Blancs jouent et GAGNENT — mais attention : dans une étude de finale, UN SEUL coup mène au but. Tous les autres laissent filer la nulle.` },
      { who: 'hortense', text: 'Prends ton temps. Compte les temps, regarde les lignes… et ne joue que lorsque tu SAIS.' },
    ],
    follow: [{ who: 'hortense', text: 'Continue — la précision jusqu\'au bout.' }],
    wrong: { who: 'hortense', text: 'Non, mon petit — après ce coup, la défense tient et c\'est la nulle. Dans les finales, « presque juste » veut dire faux. Recommence.' },
    solved: [{ who: 'hortense', text: 'LE coup juste. Tu vois : une finale ne se joue pas, elle se RÉSOUT.' }],
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
