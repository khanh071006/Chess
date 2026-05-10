import { useDrop } from 'react-dnd';
import { Position } from './types';

interface ChessSquareProps {
  row: number;
  col: number;
  isLight: boolean;
  isSelected: boolean;
  isValidMove: boolean;
  onClick: () => void;
  onDrop: (from: Position, to: Position) => boolean;
  children?: React.ReactNode;
}

export default function ChessSquare({
  row,
  col,
  isLight,
  isSelected,
  isValidMove,
  onClick,
  onDrop,
  children
}: ChessSquareProps) {
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: 'CHESS_PIECE',
    drop: (item: { position: Position }) => {
      return onDrop(item.position, { row, col });
    },
    canDrop: (item: { position: Position }) => {
      return item.position.row !== row || item.position.col !== col;
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop()
    })
  }), [row, col, onDrop]);

  const getBackgroundColor = () => {
    if (isSelected) return 'bg-yellow-400';
    if (isOver && canDrop) return isLight ? 'bg-green-300' : 'bg-green-500';
    if (isValidMove) return isLight ? 'bg-blue-200' : 'bg-blue-400';
    return isLight ? 'bg-amber-100' : 'bg-amber-700';
  };

  return (
    <div
      ref={drop}
      onClick={onClick}
      className={`
        w-20 h-20 flex items-center justify-center relative cursor-pointer
        transition-colors duration-200
        ${getBackgroundColor()}
        hover:brightness-110
      `}
    >
      {children}
      {isValidMove && !children && (
        <div className="absolute w-4 h-4 bg-slate-900 bg-opacity-30 rounded-full" />
      )}
      {isValidMove && children && (
        <div className="absolute inset-0 border-4 border-red-500 border-opacity-50 pointer-events-none" />
      )}
    </div>
  );
}
