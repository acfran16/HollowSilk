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

      {/* Energy Bar */}
      <div className="absolute top-12 left-4 flex items-center space-x-2">
        <div className="text-white font-bold">EN</div>
        <div className="w-32 h-4 bg-gray-800 border border-gray-600 rounded">
          <div
            className="h-full bg-blue-500 rounded transition-all duration-200"
            style={{ width: `${(gameState.player.energy / gameState.player.maxEnergy) * 100}%` }}
          />
        </div>
        <div className="text-white font-mono text-sm">
          {Math.round(gameState.player.energy)}/{gameState.player.maxEnergy}
        </div>
      </div>

      {/* Level and Experience */}
      <div className="absolute top-20 left-4 flex items-center space-x-4">
        <div className="text-white font-bold">
          Level {gameState.player.level}
        </div>
        <div className="w-24 h-2 bg-gray-800 border border-gray-600 rounded">
          <div
            className="h-full bg-yellow-500 rounded transition-all duration-200"
            style={{ width: `${(gameState.player.experience / (gameState.player.level * 100)) * 100}%` }}
          />
        </div>
        <div className="text-white font-mono text-xs">
          {gameState.player.experience}/{gameState.player.level * 100} XP
        </div>
      </div>

      {/* Score and Time */}
      <div className="absolute top-4 right-4 text-right">
        <div className="text-white font-bold text-lg">
          Score: {gameState.score.toLocaleString()}
        </div>
        <div className="text-gray-300 font-mono text-sm">
          Time: {Math.floor(gameState.timeElapsed / 60)}:{(Math.floor(gameState.timeElapsed % 60)).toString().padStart(2, '0')}
        </div>
      </div>
      {/* Combo Counter */}
      {gameState.player.comboCount > 0 && (
        <div className="absolute top-16 right-4 text-right">
          <div className="text-yellow-400 font-bold text-2xl">
            {gameState.player.comboCount}x COMBO
          </div>
          {gameState.player.comboCount >= 3 && (
            <div className="text-orange-400 font-bold text-sm animate-pulse">
              SPECIAL READY!
            </div>
          )}
        </div>
      )}

      {/* Status Effects */}
      <div className="absolute bottom-4 left-4 flex space-x-2">
        {gameState.player.invulnerable && (
          <div className="bg-yellow-500 text-black px-2 py-1 rounded text-xs font-bold animate-pulse">
            INVULNERABLE
          </div>
        )}
        {gameState.player.wallSliding && (
          <div className="bg-orange-500 text-white px-2 py-1 rounded text-xs font-bold">
            WALL SLIDE
          </div>
        )}
        {gameState.player.isDashing && (
          <div className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-bold">
            DASH
          </div>
        )}
      </div>
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
              <p>Hold against wall while falling - Wall Slide</p>
              <p>Jump while wall sliding - Wall Jump</p>
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
            <div className="mb-6 space-y-2">
              <p className="text-yellow-400">Final Score: {gameState.score.toLocaleString()}</p>
              <p className="text-blue-400">Level Reached: {gameState.player.level}</p>
              <p className="text-green-400">Time Survived: {Math.floor(gameState.timeElapsed / 60)}:{(Math.floor(gameState.timeElapsed % 60)).toString().padStart(2, '0')}</p>
            </div>
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
