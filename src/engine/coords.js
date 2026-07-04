/**
 * Conversions entre la numérotation officielle des cases (1..50)
 * et la grille 10x10 (row 0 en haut, col 0 à gauche).
 * Les Noirs partent en haut (cases 1-20), les Blancs en bas (31-50).
 */

/** Colonne/ligne (0..9) d'une case 1..50. */
export function squareToCell(n) {
  const row = Math.floor((n - 1) / 5);
  const col = 2 * ((n - 1) % 5) + (row % 2 === 0 ? 1 : 0);
  return { row, col };
}

/** Case 1..50 pour une cellule (row, col), ou null si case claire / hors damier. */
export function cellToSquare(row, col) {
  if (row < 0 || row > 9 || col < 0 || col > 9) return null;
  if ((row + col) % 2 === 0) return null; // cases claires : injouables
  return row * 5 + Math.floor(col / 2) + 1;
}
