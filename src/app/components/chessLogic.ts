import { PieceType, Position, PieceColor } from './types';

export function getInitialBoard(): (PieceType | null)[][] {
  const board: (PieceType | null)[][] = Array(8).fill(null).map(() => Array(8).fill(null));

  // Black pieces
  board[0][0] = { type: 'rook', color: 'black' };
  board[0][1] = { type: 'knight', color: 'black' };
  board[0][2] = { type: 'bishop', color: 'black' };
  board[0][3] = { type: 'queen', color: 'black' };
  board[0][4] = { type: 'king', color: 'black' };
  board[0][5] = { type: 'bishop', color: 'black' };
  board[0][6] = { type: 'knight', color: 'black' };
  board[0][7] = { type: 'rook', color: 'black' };

  for (let i = 0; i < 8; i++) {
    board[1][i] = { type: 'pawn', color: 'black' };
  }

  // White pieces
  board[7][0] = { type: 'rook', color: 'white' };
  board[7][1] = { type: 'knight', color: 'white' };
  board[7][2] = { type: 'bishop', color: 'white' };
  board[7][3] = { type: 'queen', color: 'white' };
  board[7][4] = { type: 'king', color: 'white' };
  board[7][5] = { type: 'bishop', color: 'white' };
  board[7][6] = { type: 'knight', color: 'white' };
  board[7][7] = { type: 'rook', color: 'white' };

  for (let i = 0; i < 8; i++) {
    board[6][i] = { type: 'pawn', color: 'white' };
  }

  return board;
}

export function isValidMove(
  from: Position,
  to: Position,
  board: (PieceType | null)[][],
  currentTurn: PieceColor
): boolean {
  // Check bounds
  if (to.row < 0 || to.row > 7 || to.col < 0 || to.col > 7) return false;

  const piece = board[from.row][from.col];
  const target = board[to.row][to.col];

  // No piece to move
  if (!piece) return false;

  // Wrong turn
  if (piece.color !== currentTurn) return false;

  // Can't capture own piece
  if (target && target.color === piece.color) return false;

  // Can't move to same square
  if (from.row === to.row && from.col === to.col) return false;

  // Check piece-specific moves
  switch (piece.type) {
    case 'pawn':
      return isValidPawnMove(from, to, board, piece.color);
    case 'rook':
      return isValidRookMove(from, to, board);
    case 'knight':
      return isValidKnightMove(from, to);
    case 'bishop':
      return isValidBishopMove(from, to, board);
    case 'queen':
      return isValidQueenMove(from, to, board);
    case 'king':
      return isValidKingMove(from, to);
    default:
      return false;
  }
}

function isValidPawnMove(
  from: Position,
  to: Position,
  board: (PieceType | null)[][],
  color: PieceColor
): boolean {
  const direction = color === 'white' ? -1 : 1;
  const startRow = color === 'white' ? 6 : 1;
  const rowDiff = to.row - from.row;
  const colDiff = Math.abs(to.col - from.col);

  // Move forward one square
  if (colDiff === 0 && rowDiff === direction && !board[to.row][to.col]) {
    return true;
  }

  // Move forward two squares from starting position
  if (
    colDiff === 0 &&
    from.row === startRow &&
    rowDiff === 2 * direction &&
    !board[to.row][to.col] &&
    !board[from.row + direction][from.col]
  ) {
    return true;
  }

  // Capture diagonally
  if (colDiff === 1 && rowDiff === direction && board[to.row][to.col]) {
    return true;
  }

  return false;
}

function isValidRookMove(
  from: Position,
  to: Position,
  board: (PieceType | null)[][]
): boolean {
  // Must move in straight line
  if (from.row !== to.row && from.col !== to.col) return false;

  return !isPathBlocked(from, to, board);
}

function isValidKnightMove(from: Position, to: Position): boolean {
  const rowDiff = Math.abs(to.row - from.row);
  const colDiff = Math.abs(to.col - from.col);

  return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
}

function isValidBishopMove(
  from: Position,
  to: Position,
  board: (PieceType | null)[][]
): boolean {
  // Must move diagonally
  if (Math.abs(to.row - from.row) !== Math.abs(to.col - from.col)) return false;

  return !isPathBlocked(from, to, board);
}

function isValidQueenMove(
  from: Position,
  to: Position,
  board: (PieceType | null)[][]
): boolean {
  return isValidRookMove(from, to, board) || isValidBishopMove(from, to, board);
}

function isValidKingMove(from: Position, to: Position): boolean {
  const rowDiff = Math.abs(to.row - from.row);
  const colDiff = Math.abs(to.col - from.col);

  return rowDiff <= 1 && colDiff <= 1;
}

function isPathBlocked(
  from: Position,
  to: Position,
  board: (PieceType | null)[][]
): boolean {
  const rowStep = to.row === from.row ? 0 : (to.row - from.row) / Math.abs(to.row - from.row);
  const colStep = to.col === from.col ? 0 : (to.col - from.col) / Math.abs(to.col - from.col);

  let currentRow = from.row + rowStep;
  let currentCol = from.col + colStep;

  while (currentRow !== to.row || currentCol !== to.col) {
    if (board[currentRow][currentCol]) return true;
    currentRow += rowStep;
    currentCol += colStep;
  }

  return false;
}
