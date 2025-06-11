import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { GameState } from "../../game/types";
import { GameEngine } from "../../game/GameEngine";

interface GameStore {
  gameState: GameState;
  gameEngine: GameEngine | null;
  
  // Actions
  initializeGame: () => void;
  setGameEngine: (engine: GameEngine) => void;
  updateGameState: (state: GameState) => void;
  togglePause: () => void;
  restartGame: () => void;
}

export const useGameState = create<GameStore>()(
  subscribeWithSelector((set, get) => ({
    gameState: {
      player: {
        health: 100,
        maxHealth: 100,
        comboCount: 0,
        position: { x: 0, y: 0 },
        velocity: { x: 0, y: 0 },
        isGrounded: false,
        isDashing: false,
        isAttacking: false,
        facingDirection: 1,
      },
      enemies: [],
      camera: {
        x: 0,
        y: 0,
        shakeX: 0,
        shakeY: 0,
      },
      isPaused: false,
      isGameOver: false,
    },
    gameEngine: null,

    initializeGame: () => {
      // Initialize game state
      console.log("Game initialized");
    },

    setGameEngine: (engine: GameEngine) => {
      set({ gameEngine: engine });
      
      // Subscribe to game state updates
      engine.onStateUpdate((state: GameState) => {
        get().updateGameState(state);
      });
    },

    updateGameState: (state: GameState) => {
      set({ gameState: state });
    },

    togglePause: () => {
      const { gameEngine, gameState } = get();
      if (gameEngine) {
        gameEngine.setPaused(!gameState.isPaused);
      }
    },

    restartGame: () => {
      const { gameEngine } = get();
      if (gameEngine) {
        gameEngine.restartGame();
      }
    },
  }))
);
