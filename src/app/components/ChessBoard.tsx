import { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import ChessSquare from './ChessSquare';
import ChessPiece from './ChessPiece';
import { PieceType, Position, GameState } from './types';
import { isValidMove, getInitialBoard } from './chessLogic';

export default function ChessBoard() {
  const [gameState, setGameState] = useState<GameState>({
    board: getInitialBoard(),
    currentTurn: 'white',
    selectedSquare: null,
    validMoves: [],
    capturedPieces: { white: [], black: [] },
    moveHistory: []
  });

  const handleSquareClick = (row: number, col: number) => {
    const piece = gameState.board[row][col];

    // If a square is already selected and this is a valid move
    if (gameState.selectedSquare) {
      const validMove = gameState.validMoves.find(
        move => move.row === row && move.col === col
      );

      if (validMove) {
        movePiece(gameState.selectedSquare, { row, col });
      } else if (piece && piece.color === gameState.currentTurn) {
        // Select new piece
        selectSquare(row, col);
      } else {
        // Deselect
        setGameState(prev => ({
          ...prev,
          selectedSquare: null,
          validMoves: []
        }));
      }
    } else if (piece && piece.color === gameState.currentTurn) {
      selectSquare(row, col);
    }
  };

  const selectSquare = (row: number, col: number) => {
    const piece = gameState.board[row][col];
    if (!piece || piece.color !== gameState.currentTurn) return;

    const validMoves = getValidMoves({ row, col }, gameState.board);
    setGameState(prev => ({
      ...prev,
      selectedSquare: { row, col },
      validMoves
    }));
  };

  const getValidMoves = (from: Position, board: (PieceType | null)[][]): Position[] => {
    const moves: Position[] = [];
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (isValidMove(from, { row, col }, board, gameState.currentTurn)) {
          moves.push({ row, col });
        }
      }
    }
    return moves;
  };

  const movePiece = (from: Position, to: Position) => {
    const newBoard = gameState.board.map(row => [...row]);
    const piece = newBoard[from.row][from.col];
    const capturedPiece = newBoard[to.row][to.col];

    if (!piece) return;

    newBoard[to.row][to.col] = piece;
    newBoard[from.row][from.col] = null;

    const newCapturedPieces = { ...gameState.capturedPieces };
    if (capturedPiece) {
      newCapturedPieces[piece.color].push(capturedPiece);
    }

    setGameState({
      board: newBoard,
      currentTurn: gameState.currentTurn === 'white' ? 'black' : 'white',
      selectedSquare: null,
      validMoves: [],
      capturedPieces: newCapturedPieces,
      moveHistory: [
        ...gameState.moveHistory,
        { from, to, piece, capturedPiece }
      ]
    });
  };

  const handleDrop = (from: Position, to: Position) => {
    if (isValidMove(from, to, gameState.board, gameState.currentTurn)) {
      movePiece(from, to);
      return true;
    }
    return false;
  };

  const resetGame = () => {
    setGameState({
      board: getInitialBoard(),
      currentTurn: 'white',
      selectedSquare: null,
      validMoves: [],
      capturedPieces: { white: [], black: [] },
      moveHistory: []
    });
  };

  const isSquareSelected = (row: number, col: number) => {
    return gameState.selectedSquare?.row === row &&
           gameState.selectedSquare?.col === col;
  };

  const isValidMoveSquare = (row: number, col: number) => {
    return gameState.validMoves.some(
      move => move.row === row && move.col === col
    );
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-col items-center gap-6 p-8">
        {/* Game Info */}
        <div className="flex items-center justify-between w-full max-w-2xl">
          <div className="text-xl font-semibold">
            Lượt đi: <span className={gameState.currentTurn === 'white' ? 'text-slate-700' : 'text-slate-900'}>
              {gameState.currentTurn === 'white' ? 'Trắng' : 'Đen'}
            </span>
          </div>
          <button
            onClick={resetGame}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Ván mới
          </button>
        </div>

        {/* Captured Pieces */}
        <div className="flex gap-8 w-full max-w-2xl">
          <div className="flex-1">
            <div className="text-sm font-medium mb-2">Quân đen bị bắt:</div>
            <div className="flex flex-wrap gap-1 min-h-8">
              {gameState.capturedPieces.white.map((piece, idx) => (
                <div key={idx} className="text-2xl opacity-50">
                  {getPieceIcon(piece)}
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium mb-2">Quân trắng bị bắt:</div>
            <div className="flex flex-wrap gap-1 min-h-8">
              {gameState.capturedPieces.black.map((piece, idx) => (
                <div key={idx} className="text-2xl opacity-50">
                  {getPieceIcon(piece)}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chess Board */}
        <div className="inline-block border-4 border-slate-800 shadow-2xl">
          <div className="grid grid-cols-8">
            {gameState.board.map((row, rowIndex) =>
              row.map((piece, colIndex) => (
                <ChessSquare
                  key={`${rowIndex}-${colIndex}`}
                  row={rowIndex}
                  col={colIndex}
                  isLight={(rowIndex + colIndex) % 2 === 0}
                  isSelected={isSquareSelected(rowIndex, colIndex)}
                  isValidMove={isValidMoveSquare(rowIndex, colIndex)}
                  onClick={() => handleSquareClick(rowIndex, colIndex)}
                  onDrop={handleDrop}
                >
                  {piece && (
                    <ChessPiece
                      piece={piece}
                      position={{ row: rowIndex, col: colIndex }}
                    />
                  )}
                </ChessSquare>
              ))
            )}
          </div>
        </div>

        {/* Coordinates */}
        <div className="text-sm text-slate-600 text-center">
          Nhấn vào quân cờ để chọn, sau đó nhấn vào ô đích để di chuyển<br />
          Hoặc kéo và thả quân cờ để di chuyển
        </div>
      </div>
    </DndProvider>
  );
}

function getPieceIcon(piece: PieceType): string {
  const icons = {
    white: { king: '♔', queen: '♕', rook: '♖', bishop: '♗', knight: '♘', pawn: '♙' },
    black: { king: '♚', queen: '♛', rook: '♜', bishop: '♝', knight: '♞', pawn: '♟' }
  };
  return icons[piece.color][piece.type];
}
