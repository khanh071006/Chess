import ChessBoardWithAI from './components/ChessBoardWithAI';

export default function App() {
  return (
    <div className="size-full min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="w-full">
        <h1 className="text-5xl font-bold text-center pt-8 mb-4 text-white">
          🤖 Cờ Vua AI
        </h1>
        <p className="text-center text-slate-300 mb-4">
          Chơi cờ với AI thông minh sử dụng thuật toán Minimax
        </p>
        <ChessBoardWithAI />
      </div>
    </div>
  );
}