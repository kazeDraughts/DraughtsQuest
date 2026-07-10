/**
 * Aide au PAS-À-PAS des rafles : au lieu de montrer directement la case
 * finale, on laisse le joueur suivre le chemin saut après saut — essentiel
 * pour qu'un débutant COMPRENNE la rafle au lieu qu'on la lui mâche.
 *
 * Un coup de rafle du moteur porte : { from, to, captures:[pièces prises],
 * jumps:[cases de passage, départ inclus] }. Pour L prises, jumps a L+1
 * entrées et captures[i] est la pièce sautée entre jumps[i] et jumps[i+1].
 *
 * Ces fonctions sont PURES (aucun effet de bord, aucune dépendance au DOM) :
 * elles sont testées par tests/rafle.test.mjs et réutilisées à la fois par
 * le contrôleur de partie (match.js) et les exercices (story/training.js).
 */

/** Y a-t-il une rafle (≥2 prises) à jouer depuis la case `from` ? */
export function isRafleFrom(moves, from) {
  const here = moves.filter((m) => m.from === from);
  return here.length > 0 && here[0].captures.length >= 2;
}

/** État de rafle en cours : chemin parcouru + coups encore compatibles. */
export function rafleStart(moves, from) {
  return {
    from,
    path: [from],
    candidates: moves.filter((m) => m.from === from),
    captured: [],
  };
}

/**
 * Prochains sauts possibles depuis l'état courant.
 * @returns {{to:number, capture:number}[]} case d'atterrissage + pièce prise
 */
export function rafleNextHops(state) {
  const depth = state.path.length; // index du prochain atterrissage dans jumps
  const out = [];
  const seen = new Set();
  for (const m of state.candidates) {
    const land = m.jumps[depth];
    if (land == null || seen.has(land)) continue;
    seen.add(land);
    out.push({ to: land, capture: m.captures[depth - 1] });
  }
  return out;
}

/**
 * Tente d'avancer la rafle d'un saut vers la case `sq`.
 * @returns {{ok:false}} sq n'est pas un saut valide (on ignore le tap)
 *        | {ok:true, done:false, state}  la rafle continue
 *        | {ok:true, done:true, move}    la rafle est complète (coup à jouer)
 */
export function rafleAdvance(state, sq) {
  const depth = state.path.length;
  const next = state.candidates.filter((m) => m.jumps[depth] === sq);
  if (!next.length) return { ok: false };
  const capture = next[0].captures[depth - 1];
  const path = [...state.path, sq];
  const captured = [...state.captured, capture];
  const done = next.find((m) => m.jumps.length === path.length);
  if (done) return { ok: true, done: true, move: done };
  return { ok: true, done: false, state: { ...state, path, candidates: next, captured } };
}

/**
 * Damier « intermédiaire » à afficher : la pièce a sauté jusqu'à la case
 * courante et les pièces déjà prises ont disparu (le vrai coup n'est appliqué
 * qu'à la fin). `engineBoard` provient de RulesEngine.getBoard() (tableau neuf).
 */
export function rafleBoard(engineBoard, state) {
  const board = engineBoard.slice();
  const piece = board[state.from];
  board[state.from] = null;
  for (const c of state.captured) board[c] = null;
  board[state.path[state.path.length - 1]] = piece;
  return board;
}
