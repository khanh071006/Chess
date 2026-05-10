export type PieceColor = 'white' | 'black';
export type PieceKind = 'king' | 'queen' | 'rook' | 'bishop' | 'knight' | 'pawn';

export interface PieceType {
  type: PieceKind;
  color: PieceColor;
}

export interface Position {
  row: number;
  col: number;
}

export interface Move {
  from: Position;
  to: Position;
  piece: PieceType;
  capturedPiece: PieceType | null;
}

export interface GameState {
  board: (PieceType | null)[][];
  currentTurn: PieceColor;
  selectedSquare: Position | null;
  validMoves: Position[];
  capturedPieces: {
    white: PieceType[];
    black: PieceType[];
  };
  moveHistory: Move[];
}
