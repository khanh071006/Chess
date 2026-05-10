import { useState } from 'react';
import { Difficulty } from './ChessAI';

interface GameSetupProps {
  onStartGame: (color: 'white' | 'black', difficulty: Difficulty) => void;
}

export default function GameSetup({ onStartGame }: GameSetupProps) {
  const [selectedColor, setSelectedColor] = useState<'white' | 'black'>('white');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('medium');

  const difficulties: { value: Difficulty; label: string; description: string }[] = [
    { value: 'easy', label: 'Dễ', description: 'Phù hợp cho người mới' },
    { value: 'medium', label: 'Trung bình', description: 'Thử thách vừa phải' },
    { value: 'hard', label: 'Khó', description: 'Cho người chơi giỏi' },
    { value: 'expert', label: 'Chuyên gia', description: 'AI mạnh nhất' }
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <div className="bg-slate-800 rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
        <h2 className="text-3xl font-bold text-white text-center mb-8">
          Thiết lập ván cờ
        </h2>

        {/* Color Selection */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-white mb-4">Chọn màu quân:</h3>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setSelectedColor('white')}
              className={`
                p-6 rounded-xl border-2 transition-all
                ${selectedColor === 'white'
                  ? 'border-blue-500 bg-blue-500 bg-opacity-20'
                  : 'border-slate-600 hover:border-slate-500'
                }
              `}
            >
              <div className="text-6xl mb-2">♔</div>
              <div className="text-white font-semibold">Quân Trắng</div>
              <div className="text-slate-400 text-sm">Đi trước</div>
            </button>
            <button
              onClick={() => setSelectedColor('black')}
              className={`
                p-6 rounded-xl border-2 transition-all
                ${selectedColor === 'black'
                  ? 'border-blue-500 bg-blue-500 bg-opacity-20'
                  : 'border-slate-600 hover:border-slate-500'
                }
              `}
            >
              <div className="text-6xl mb-2">♚</div>
              <div className="text-white font-semibold">Quân Đen</div>
              <div className="text-slate-400 text-sm">Đi sau</div>
            </button>
          </div>
        </div>

        {/* Difficulty Selection */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-white mb-4">Chọn độ khó:</h3>
          <div className="grid grid-cols-2 gap-4">
            {difficulties.map((diff) => (
              <button
                key={diff.value}
                onClick={() => setSelectedDifficulty(diff.value)}
                className={`
                  p-4 rounded-xl border-2 transition-all text-left
                  ${selectedDifficulty === diff.value
                    ? 'border-blue-500 bg-blue-500 bg-opacity-20'
                    : 'border-slate-600 hover:border-slate-500'
                  }
                `}
              >
                <div className="text-white font-semibold text-lg mb-1">
                  {diff.label}
                </div>
                <div className="text-slate-400 text-sm">
                  {diff.description}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* AI Info */}
        <div className="bg-slate-700 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="text-2xl">🤖</div>
            <div>
              <div className="text-white font-semibold mb-1">
                AI Engine: Minimax với Alpha-Beta Pruning
              </div>
              <div className="text-slate-300 text-sm">
                Sử dụng thuật toán Minimax kết hợp Alpha-Beta Pruning và Piece-Square Tables
                để đánh giá vị trí và tìm nước đi tối ưu.
              </div>
            </div>
          </div>
        </div>

        {/* Start Button */}
        <button
          onClick={() => onStartGame(selectedColor, selectedDifficulty)}
          className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xl font-bold rounded-xl
                   hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-105 active:scale-95
                   shadow-lg"
        >
          Bắt đầu chơi
        </button>
      </div>
    </div>
  );
}
