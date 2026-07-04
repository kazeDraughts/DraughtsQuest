/**
 * Fonction d'évaluation d'une position de dames internationales.
 * Score en "centipions", du POINT DE VUE DES BLANCS (positif = avantage blanc).
 *
 * Composantes :
 * - matériel (un pion = 100, une dame = 320) ;
 * - avancement des pions (plus près de la promotion = mieux) ;
 * - contrôle du centre ;
 * - solidité de la rangée arrière (freine les promotions adverses) ;
 * - cohésion (pièces soutenues par une pièce amie en diagonale).
 */

import { squareToCell, cellToSquare } from '../engine/coords.js';

const MAN = 100;
const KING = 320;

// Pré-calcul cellule de chaque case (1..50)
const CELLS = [null];
for (let n = 1; n <= 50; n++) CELLS.push(squareToCell(n));

// Voisins diagonaux immédiats de chaque case (pour la cohésion)
const NEIGHBORS = [null];
for (let n = 1; n <= 50; n++) {
  const { row, col } = CELLS[n];
  NEIGHBORS.push([
    cellToSquare(row - 1, col - 1), cellToSquare(row - 1, col + 1),
    cellToSquare(row + 1, col - 1), cellToSquare(row + 1, col + 1),
  ].filter(Boolean));
}

/**
 * @param {Array} board tableau 1..50 ('w','W','b','B' ou null)
 * @returns {number} score, positif si les Blancs sont mieux
 */
export function evaluate(board) {
  let score = 0;
  let whitePieces = 0;
  let blackPieces = 0;

  for (let n = 1; n <= 50; n++) {
    const p = board[n];
    if (!p) continue;
    const { row, col } = CELLS[n];
    const isWhite = p === 'w' || p === 'W';
    let v;

    if (p === 'w' || p === 'b') {
      v = MAN;
      // Avancement : le pion blanc monte (row 9 -> 0), le noir descend.
      v += (isWhite ? 9 - row : row) * 4;
      // Rangée arrière gardée (défense de la promotion adverse)
      if ((isWhite && row === 9) || (!isWhite && row === 0)) v += 8;
    } else {
      v = KING;
    }

    // Centre du damier
    if (col >= 3 && col <= 6 && row >= 3 && row <= 6) v += 6;
    else if (col === 0 || col === 9) v -= 4; // les bords sont passifs

    // Cohésion : soutenu par au moins une pièce amie voisine
    const friends = NEIGHBORS[n].reduce((k, m) => {
      const q = board[m];
      return k + (q && ((q === 'w' || q === 'W') === isWhite) ? 1 : 0);
    }, 0);
    v += Math.min(friends, 2) * 3;

    if (isWhite) { score += v; whitePieces++; }
    else { score -= v; blackPieces++; }
  }

  // En fin de partie gagnante, encourager l'échange : bonus au camp en tête
  // proportionnel à la raréfaction du matériel.
  const total = whitePieces + blackPieces;
  if (total > 0 && whitePieces !== blackPieces) {
    const lead = whitePieces > blackPieces ? 1 : -1;
    score += lead * Math.max(0, 24 - total) * 6;
  }

  return score;
}

/** Score d'une victoire (modulé par la profondeur : gagner vite > gagner tard). */
export const WIN_SCORE = 100000;
