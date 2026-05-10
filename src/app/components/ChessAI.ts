import { Chess, Square, Move } from 'chess.js';

// Piece values
const PIECE_VALUES: { [key: string]: number } = {
  p: 100,   // Pawn
  n: 320,   // Knight
  b: 330,   // Bishop
  r: 500,   // Rook
  q: 900,   // Queen
  k: 20000  // King
};

// Piece-Square Tables for positional evaluation
const PAWN_TABLE = [
  0,  0,  0,  0,  0,  0,  0,  0,
  50, 50, 50, 50, 50, 50, 50, 50,
  10, 10, 20, 30, 30, 20, 10, 10,
  5,  5, 10, 25, 25, 10,  5,  5,
  0,  0,  0, 20, 20,  0,  0,  0,
  5, -5,-10,  0,  0,-10, -5,  5,
  5, 10, 10,-20,-20, 10, 10,  5,
  0,  0,  0,  0,  0,  0,  0,  0
];

const KNIGHT_TABLE = [
  -50,-40,-30,-30,-30,-30,-40,-50,
  -40,-20,  0,  0,  0,  0,-20,-40,
  -30,  0, 10, 15, 15, 10,  0,-30,
  -30,  5, 15, 20, 20, 15,  5,-30,
  -30,  0, 15, 20, 20, 15,  0,-30,
  -30,  5, 10, 15, 15, 10,  5,-30,
  -40,-20,  0,  5,  5,  0,-20,-40,
  -50,-40,-30,-30,-30,-30,-40,-50
];

const BISHOP_TABLE = [
  -20,-10,-10,-10,-10,-10,-10,-20,
  -10,  0,  0,  0,  0,  0,  0,-10,
  -10,  0,  5, 10, 10,  5,  0,-10,
  -10,  5,  5, 10, 10,  5,  5,-10,
  -10,  0, 10, 10, 10, 10,  0,-10,
  -10, 10, 10, 10, 10, 10, 10,-10,
  -10,  5,  0,  0,  0,  0,  5,-10,
  -20,-10,-10,-10,-10,-10,-10,-20
];

const ROOK_TABLE = [
  0,  0,  0,  0,  0,  0,  0,  0,
  5, 10, 10, 10, 10, 10, 10,  5,
  -5,  0,  0,  0,  0,  0,  0, -5,
  -5,  0,  0,  0,  0,  0,  0, -5,
  -5,  0,  0,  0,  0,  0,  0, -5,
  -5,  0,  0,  0,  0,  0,  0, -5,
  -5,  0,  0,  0,  0,  0,  0, -5,
  0,  0,  0,  5,  5,  0,  0,  0
];

const QUEEN_TABLE = [
  -20,-10,-10, -5, -5,-10,-10,-20,
  -10,  0,  0,  0,  0,  0,  0,-10,
  -10,  0,  5,  5,  5,  5,  0,-10,
  -5,  0,  5,  5,  5,  5,  0, -5,
  0,  0,  5,  5,  5,  5,  0, -5,
  -10,  5,  5,  5,  5,  5,  0,-10,
  -10,  0,  5,  0,  0,  0,  0,-10,
  -20,-10,-10, -5, -5,-10,-10,-20
];

const KING_MIDDLE_GAME_TABLE = [
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -20,-30,-30,-40,-40,-30,-30,-20,
  -10,-20,-20,-20,-20,-20,-20,-10,
  20, 20,  0,  0,  0,  0, 20, 20,
  20, 30, 10,  0,  0, 10, 30, 20
];

const KING_END_GAME_TABLE = [
  -50,-40,-30,-20,-20,-30,-40,-50,
  -30,-20,-10,  0,  0,-10,-20,-30,
  -30,-10, 20, 30, 30, 20,-10,-30,
  -30,-10, 30, 40, 40, 30,-10,-30,
  -30,-10, 30, 40, 40, 30,-10,-30,
  -30,-10, 20, 30, 30, 20,-10,-30,
  -30,-30,  0,  0,  0,  0,-30,-30,
  -50,-30,-30,-30,-30,-30,-30,-50
];

export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

const DIFFICULTY_DEPTHS: { [key in Difficulty]: number } = {
  easy: 2,
  medium: 3,
  hard: 4,
  expert: 5
};

export class ChessAI {
  private game: Chess;
  private difficulty: Difficulty;
  private nodesSearched: number = 0;

  constructor(fen?: string, difficulty: Difficulty = 'medium') {
    this.game = fen ? new Chess(fen) : new Chess();
    this.difficulty = difficulty;
  }

  public getBestMove(): Move | null {
    this.nodesSearched = 0;
    const depth = DIFFICULTY_DEPTHS[this.difficulty];
    const startTime = Date.now();

    const result = this.minimax(depth, -Infinity, Infinity, true);

    const timeElapsed = Date.now() - startTime;
    console.log(`AI searched ${this.nodesSearched} positions in ${timeElapsed}ms at depth ${depth}`);

    return result.move;
  }

  private minimax(
    depth: number,
    alpha: number,
    beta: number,
    isMaximizing: boolean
  ): { score: number; move: Move | null } {
    this.nodesSearched++;

    if (depth === 0) {
      return { score: this.evaluateBoard(), move: null };
    }

    const moves = this.game.moves({ verbose: true });

    if (moves.length === 0) {
      if (this.game.isCheckmate()) {
        return { score: isMaximizing ? -Infinity : Infinity, move: null };
      }
      return { score: 0, move: null }; // Stalemate
    }

    // Move ordering: prioritize captures
    const orderedMoves = this.orderMoves(moves);

    let bestMove: Move | null = null;

    if (isMaximizing) {
      let maxScore = -Infinity;

      for (const move of orderedMoves) {
        this.game.move(move);
        const score = this.minimax(depth - 1, alpha, beta, false).score;
        this.game.undo();

        if (score > maxScore) {
          maxScore = score;
          bestMove = move;
        }

        alpha = Math.max(alpha, score);
        if (beta <= alpha) {
          break; // Beta cutoff
        }
      }

      return { score: maxScore, move: bestMove };
    } else {
      let minScore = Infinity;

      for (const move of orderedMoves) {
        this.game.move(move);
        const score = this.minimax(depth - 1, alpha, beta, true).score;
        this.game.undo();

        if (score < minScore) {
          minScore = score;
          bestMove = move;
        }

        beta = Math.min(beta, score);
        if (beta <= alpha) {
          break; // Alpha cutoff
        }
      }

      return { score: minScore, move: bestMove };
    }
  }

  private orderMoves(moves: Move[]): Move[] {
    return moves.sort((a, b) => {
      // Prioritize captures
      const aCapture = a.captured ? 1 : 0;
      const bCapture = b.captured ? 1 : 0;
      return bCapture - aCapture;
    });
  }

  private evaluateBoard(): number {
    let score = 0;
    const board = this.game.board();

    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const piece = board[i][j];
        if (piece) {
          const pieceValue = this.getPieceValue(piece.type, piece.color, i, j);
          score += piece.color === 'b' ? pieceValue : -pieceValue;
        }
      }
    }

    return score;
  }

  private getPieceValue(
    pieceType: string,
    color: string,
    row: number,
    col: number
  ): number {
    const baseValue = PIECE_VALUES[pieceType] || 0;
    let positionalValue = 0;

    const index = color === 'w' ? (7 - row) * 8 + col : row * 8 + col;

    switch (pieceType) {
      case 'p':
        positionalValue = PAWN_TABLE[index];
        break;
      case 'n':
        positionalValue = KNIGHT_TABLE[index];
        break;
      case 'b':
        positionalValue = BISHOP_TABLE[index];
        break;
      case 'r':
        positionalValue = ROOK_TABLE[index];
        break;
      case 'q':
        positionalValue = QUEEN_TABLE[index];
        break;
      case 'k':
        const isEndGame = this.isEndGame();
        positionalValue = isEndGame
          ? KING_END_GAME_TABLE[index]
          : KING_MIDDLE_GAME_TABLE[index];
        break;
    }

    return baseValue + positionalValue;
  }

  private isEndGame(): boolean {
    const pieces = this.game.board().flat().filter(p => p !== null);
    return pieces.length <= 12;
  }

  public setDifficulty(difficulty: Difficulty) {
    this.difficulty = difficulty;
  }

  public updatePosition(fen: string) {
    this.game = new Chess(fen);
  }
}
