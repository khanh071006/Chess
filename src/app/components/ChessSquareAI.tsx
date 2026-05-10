import { useDrop } from 'react-dnd';
import { Square } from 'chess.js';

interface ChessSquareAIProps {
  square: Square;
  isLight: boolean;
  isSelected: boolean;
  isValidMove: boolean;
  isLastMove: boolean;
  onClick: () => void;
  onDrop: (from: Square, to: Square) => boolean;
  children?: React.ReactNode;
  disabled?: boolean;
}

export default function ChessSquareAI({
  square,
  isLight,
  isSelected,
  isValidMove,
  isLastMove,
  onClick,
  onDrop,
  children,
  disabled = false
}: ChessSquareAIProps) {
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: 'CHESS_PIECE',
    drop: (item: { square: Square }) => {
      return onDrop(item.square, square);
    },
    canDrop: () => !disabled,
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop()
    })
  }), [square, onDrop, disabled]);

  const getBackgroundColor = () => {
    if (isSelected) return 'bg-yellow-400';
    if (isLastMove) return isLight ? 'bg-yellow-200' : 'bg-yellow-600';
    if (isOver && canDrop) return isLight ? 'bg-green-300' : 'bg-green-500';
    if (isValidMove) return isLight ? 'bg-blue-200' : 'bg-blue-400';
    return isLight ? 'bg-amber-100' : 'bg-amber-700';
  };

  return (
    <div
      ref={drop}
      onClick={disabled ? undefined : onClick}
      className={`
        w-20 h-20 flex items-center justify-center relative
        transition-all duration-200
        ${getBackgroundColor()}
        ${disabled ? 'cursor-not-allowed opacity-75' : 'cursor-pointer hover:brightness-110'}
      `}
    >
      {children}
      {isValidMove && !children && (
        <div className="absolute w-4 h-4 bg-slate-900 bg-opacity-30 rounded-full" />
      )}
      {isValidMove && children && (
        <div className="absolute inset-0 border-4 border-red-500 border-opacity-50 rounded-full pointer-events-none" />
      )}
    </div>
  );
}
