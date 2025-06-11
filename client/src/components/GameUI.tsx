import { useGameState } from "../lib/stores/useGameState";

export default function GameUI() {
  const { gameState, togglePause } = useGameState();

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      togglePause();
    }
  };

  return (
    <div className="game-ui" onKeyDown={handleKeyPress} tabIndex={0}>
      {/* Health Bar */}
      <div className="absolute top-4 left-4 flex items-center space-x-2">
        <div className="text-white font-bold">HP</div>
        <div className="w-32 h-4 bg-gray-800 border border-gray-600 rounded">
          <div
            className="h-full bg-red-500 rounded transition-all duration-200"
            style={{ width: `${(gameState.player.health / gameState.player.maxHealth) * 100}%` }}
          />
        </div>
        <div className="text-white font-mono text-sm">
          {gameState.player.health}/{gameState.player.maxHealth}
        </div>
      </div>

      {/* Combo Counter */}
      {gameState.player.comboCount > 0 && (
        <div className="absolute top-4 right-4 text-right">
          <div className="text-yellow-400 font-bold text-2xl">
            {gameState.player.comboCount}x COMBO
          </div>
        </div>
      )}

      {/* Pause Menu */}
      {gameState.isPaused && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-gray-900 border border-gray-600 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Game Paused</h2>
            <p className="text-gray-300 mb-4">Press ESC to resume</p>
            <div className="space-y-2 text-sm text-gray-400">
              <p>A/D or ←/→ - Move Left/Right</p>
              <p>Space/W/↑ - Jump</p>
              <p>Shift - Dash</p>
              <p>J - Attack</p>
              <p>K - Special Attack (3+ combo)</p>
            </div>
          </div>
        </div>
      )}

      {/* Game Over Screen */}
      {gameState.isGameOver && (
        <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center">
          <div className="bg-gray-900 border border-gray-600 rounded-lg p-8 text-center">
            <h2 className="text-3xl font-bold mb-4 text-red-400">Game Over</h2>
            <p className="text-gray-300 mb-6">You have been defeated...</p>
            <button
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white font-semibold"
              onClick={() => window.location.reload()}
            >
              Restart Game
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
