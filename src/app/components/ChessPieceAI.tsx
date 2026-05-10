import { useDrag } from 'react-dnd';
import { Square } from 'chess.js';

interface ChessPieceAIProps {
  piece: 'wp' | 'wn' | 'wb' | 'wr' | 'wq' | 'wk' | 'bp' | 'bn' | 'bb' | 'br' | 'bq' | 'bk';
  square: Square;
}

const pieceSymbols: { [key: string]: string } = {
  'wp': '♙', 'wn': '♘', 'wb': '♗', 'wr': '♖', 'wq': '♕', 'wk': '♔',
  'bp': '♟', 'bn': '♞', 'bb': '♝', 'br': '♜', 'bq': '♛', 'bk': '♚'
};

export default function ChessPieceAI({ piece, square }: ChessPieceAIProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'CHESS_PIECE',
    item: { square },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging()
    })
  }), [square]);

  const isWhite = piece[0] === 'w';

  return (
    <div
      ref={drag}
      className={`
        text-6xl cursor-move select-none
        transition-all duration-200
        ${isDragging ? 'opacity-50 scale-110' : 'opacity-100 scale-100'}
        hover:scale-110 active:scale-95
        ${isWhite ? 'text-slate-100' : 'text-slate-900'}
      `}
      style={{
        filter: isWhite
          ? 'drop-shadow(0 0 1px black) drop-shadow(0 0 1px black) drop-shadow(0 2px 2px rgba(0,0,0,0.8))'
          : 'drop-shadow(0 0 1px white) drop-shadow(0 0 1px black) drop-shadow(0 2px 2px rgba(255,255,255,0.3))'
      }}
    >
      {pieceSymbols[piece]}
    </div>
  );
}
