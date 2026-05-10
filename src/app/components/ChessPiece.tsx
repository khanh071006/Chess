import { useDrag } from 'react-dnd';
import { PieceType, Position } from './types';

interface ChessPieceProps {
  piece: PieceType;
  position: Position;
}

export default function ChessPiece({ piece, position }: ChessPieceProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'CHESS_PIECE',
    item: { position },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging()
    })
  }), [position]);

  const getPieceIcon = (): string => {
    const icons = {
      white: { king: '♔', queen: '♕', rook: '♖', bishop: '♗', knight: '♘', pawn: '♙' },
      black: { king: '♚', queen: '♛', rook: '♜', bishop: '♝', knight: '♞', pawn: '♟' }
    };
    return icons[piece.color][piece.type];
  };

  return (
    <div
      ref={drag}
      className={`
        text-6xl cursor-move select-none
        transition-all duration-200
        ${isDragging ? 'opacity-50 scale-110' : 'opacity-100 scale-100'}
        hover:scale-110 active:scale-95
        ${piece.color === 'white' ? 'text-slate-100 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]' : 'text-slate-900 drop-shadow-[0_2px_2px_rgba(255,255,255,0.3)]'}
      `}
      style={{
        filter: piece.color === 'white'
          ? 'drop-shadow(0 0 1px black) drop-shadow(0 0 1px black)'
          : 'drop-shadow(0 0 1px white) drop-shadow(0 0 1px black)'
      }}
    >
      {getPieceIcon()}
    </div>
  );
}
