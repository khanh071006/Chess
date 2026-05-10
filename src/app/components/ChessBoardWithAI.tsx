import { useState, useEffect } from 'react';
import { Chess, Square, Move } from 'chess.js';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import ChessSquareAI from './ChessSquareAI';
import ChessPieceAI from './ChessPieceAI';
import { ChessAI, Difficulty } from './ChessAI';
import GameSetup from './GameSetup';

type GameMode = 'setup' | 'playing';
type PlayerColor = 'white' | 'black';

const pieceSymbols: { [key: string]: string } = {
  'wp': '♙', 'wn': '♘', 'wb': '♗', 'wr': '♖', 'wq': '♕', 'wk': '♔',
  'bp': '♟', 'bn': '♞', 'bb': '♝', 'br': '♜', 'bq': '♛', 'bk': '♚'
};

export default function ChessBoardWithAI() {
  const [game, setGame] = useState(new Chess());
  const [ai, setAi] = useState<ChessAI | null>(null);
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [validMoves, setValidMoves] = useState<Square[]>([]);
  const [gameMode, setGameMode] = useState<GameMode>('setup');
  const [playerColor, setPlayerColor] = useState<PlayerColor>('white');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);
  const [capturedPieces, setCapturedPieces] = useState<{ white: string[]; black: string[] }>({
    white: [],
    black: []
  });

  useEffect(() => {
    if (gameMode === 'playing' && game.turn() !== playerColor[0]) {
      makeAIMove();
    }
  }, [game, gameMode, playerColor]);

  const startGame = (color: PlayerColor, diff: Difficulty) => {
    const newGame = new Chess();
    setGame(newGame);
    setPlayerColor(color);
    setDifficulty(diff);
    setAi(new ChessAI(newGame.fen(), diff));
    setGameMode('playing');
    setSelectedSquare(null);
    setValidMoves([]);
    setLastMove(null);
    setCapturedPieces({ white: [], black: [] });

    if (color === 'black') {
      setTimeout(() => {
        makeAIMove();
      }, 500);
    }
  };

  const makeAIMove = async () => {
    if (!ai || isAiThinking) return;

    setIsAiThinking(true);

    // Add delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      const bestMove = ai.getBestMove();
      if (bestMove) {
        const newGame = new Chess(game.fen());
        const result = newGame.move(bestMove);

        if (result) {
          setGame(newGame);
          ai.updatePosition(newGame.fen());
          setLastMove({ from: bestMove.from, to: bestMove.to });

          if (result.captured) {
            updateCapturedPieces(result.captured, playerColor === 'white' ? 'black' : 'white');
          }
        }
      }
    } catch (error) {
      console.error('AI move error:', error);
    } finally {
      setIsAiThinking(false);
    }
  };

  const updateCapturedPieces = (pieceType: string, capturedBy: string) => {
    setCapturedPieces(prev => ({
      ...prev,
      [capturedBy]: [...prev[capturedBy as keyof typeof prev], pieceType]
    }));
  };

  const handleSquareClick = (square: Square) => {
    if (isAiThinking || game.turn() !== playerColor[0]) return;

    const piece = game.get(square);

    if (selectedSquare) {
      if (validMoves.includes(square)) {
        makeMove(selectedSquare, square);
      } else if (piece && piece.color === playerColor[0]) {
        selectSquare(square);
      } else {
        setSelectedSquare(null);
        setValidMoves([]);
      }
    } else if (piece && piece.color === playerColor[0]) {
      selectSquare(square);
    }
  };

  const selectSquare = (square: Square) => {
    const moves = game.moves({ square, verbose: true });
    const targetSquares = moves.map(move => move.to);
    setSelectedSquare(square);
    setValidMoves(targetSquares);
  };

  const makeMove = (from: Square, to: Square) => {
    try {
      const newGame = new Chess(game.fen());
      const result = newGame.move({ from, to, promotion: 'q' });

      if (result) {
        setGame(newGame);
        if (ai) {
          ai.updatePosition(newGame.fen());
        }
        setLastMove({ from, to });
        setSelectedSquare(null);
        setValidMoves([]);

        if (result.captured) {
          updateCapturedPieces(result.captured, playerColor);
        }
      }
    } catch (error) {
      console.error('Move error:', error);
    }
  };

  const handleDrop = (from: Square, to: Square): boolean => {
    if (isAiThinking || game.turn() !== playerColor[0]) return false;

    try {
      const newGame = new Chess(game.fen());
      const result = newGame.move({ from, to, promotion: 'q' });

      if (result) {
        setGame(newGame);
        if (ai) {
          ai.updatePosition(newGame.fen());
        }
        setLastMove({ from, to });
        setSelectedSquare(null);
        setValidMoves([]);

        if (result.captured) {
          updateCapturedPieces(result.captured, playerColor);
        }
        return true;
      }
    } catch (error) {
      console.error('Drop error:', error);
    }
    return false;
  };

  const resetGame = () => {
    setGameMode('setup');
    setGame(new Chess());
    setAi(null);
    setSelectedSquare(null);
    setValidMoves([]);
    setLastMove(null);
    setCapturedPieces({ white: [], black: [] });
  };

  const renderSquare = (square: Square, row: number, col: number) => {
    const piece = game.get(square);
    const isLight = (row + col) % 2 === 0;
    const isSelected = selectedSquare === square;
    const isValidMove = validMoves.includes(square);
    const isLastMoveSquare = lastMove && (lastMove.from === square || lastMove.to === square);

    return (
      <ChessSquareAI
        key={square}
        square={square}
        isLight={isLight}
        isSelected={isSelected}
        isValidMove={isValidMove}
        isLastMove={isLastMoveSquare || false}
        onClick={() => handleSquareClick(square)}
        onDrop={handleDrop}
        disabled={isAiThinking}
      >
        {piece && (
          <ChessPieceAI
            piece={`${piece.color}${piece.type}` as any}
            square={square}
          />
        )}
      </ChessSquareAI>
    );
  };

  const renderBoard = () => {
    const squares: JSX.Element[] = [];
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const ranks = playerColor === 'white' ? [0, 1, 2, 3, 4, 5, 6, 7] : [7, 6, 5, 4, 3, 2, 1, 0];

    for (const row of ranks) {
      for (let col = 0; col < 8; col++) {
        const actualCol = playerColor === 'white' ? col : 7 - col;
        const square = `${files[actualCol]}${8 - row}` as Square;
        squares.push(renderSquare(square, row, actualCol));
      }
    }

    return squares;
  };

  const getStatusMessage = () => {
    if (game.isCheckmate()) {
      return game.turn() === playerColor[0] ? '🎉 AI thắng!' : '🎉 Bạn thắng!';
    }
    if (game.isDraw()) return '🤝 Hòa!';
    if (game.isStalemate()) return '🤝 Hòa cờ!';
    if (game.isCheck()) return '⚠️ Chiếu!';
    if (isAiThinking) return '🤔 AI đang suy nghĩ...';
    if (game.turn() === playerColor[0]) return '👤 Lượt của bạn';
    return '🤖 Lượt của AI';
  };

  if (gameMode === 'setup') {
    return <GameSetup onStartGame={startGame} />;
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-col items-center gap-6 p-8">
        {/* Status Bar */}
        <div className="flex items-center justify-between w-full max-w-3xl">
          <div className="flex items-center gap-4">
            <div className="text-xl font-semibold text-white">
              {getStatusMessage()}
            </div>
            <div className="px-3 py-1 bg-slate-700 text-white rounded-lg text-sm">
              Độ khó: {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
            </div>
          </div>
          <button
            onClick={resetGame}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Ván mới
          </button>
        </div>

        <div className="flex gap-8 items-start">
          {/* Captured pieces - Opponent */}
          <div className="w-32">
            <div className="text-sm font-medium mb-2 text-white">
              {playerColor === 'white' ? 'Quân đen bị bắt:' : 'Quân trắng bị bắt:'}
            </div>
            <div className="flex flex-wrap gap-1 min-h-8 bg-slate-800 p-2 rounded">
              {(playerColor === 'white' ? capturedPieces.white : capturedPieces.black).map((piece, idx) => (
                <div key={idx} className="text-2xl opacity-70">
                  {pieceSymbols[`${playerColor === 'white' ? 'b' : 'w'}${piece}`]}
                </div>
              ))}
            </div>
          </div>

          {/* Chess Board */}
          <div className="inline-block border-4 border-slate-800 shadow-2xl">
            <div className="grid grid-cols-8">
              {renderBoard()}
            </div>
          </div>

          {/* Captured pieces - Player */}
          <div className="w-32">
            <div className="text-sm font-medium mb-2 text-white">
              {playerColor === 'white' ? 'Quân trắng bị bắt:' : 'Quân đen bị bắt:'}
            </div>
            <div className="flex flex-wrap gap-1 min-h-8 bg-slate-800 p-2 rounded">
              {(playerColor === 'white' ? capturedPieces.black : capturedPieces.white).map((piece, idx) => (
                <div key={idx} className="text-2xl opacity-70">
                  {pieceSymbols[`${playerColor === 'white' ? 'w' : 'b'}${piece}`]}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="text-sm text-slate-400 text-center max-w-2xl">
          Nhấn vào quân cờ để chọn, sau đó nhấn vào ô đích để di chuyển<br />
          Hoặc kéo và thả quân cờ để di chuyển
        </div>

        {/* Game Over Message */}
        {(game.isGameOver()) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 text-center shadow-2xl">
              <div className="text-4xl mb-4">
                {game.isCheckmate()
                  ? game.turn() === playerColor[0]
                    ? '😢'
                    : '🎉'
                  : '🤝'}
              </div>
              <div className="text-2xl font-bold mb-4">
                {game.isCheckmate()
                  ? game.turn() === playerColor[0]
                    ? 'AI Thắng!'
                    : 'Bạn Thắng!'
                  : 'Hòa Cờ!'}
              </div>
              <button
                onClick={resetGame}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Chơi lại
              </button>
            </div>
          </div>
        )}
      </div>
    </DndProvider>
  );
}
