import { useEffect, useRef } from "react";
import GameCanvas from "./GameCanvas";
import GameUI from "./GameUI";
import { GameEngine } from "../game/GameEngine";
import { useGameState } from "../lib/stores/useGameState";

export default function Game() {
  const gameEngineRef = useRef<GameEngine | null>(null);
  const { gameState, setGameEngine } = useGameState();

  useEffect(() => {
    if (!gameEngineRef.current) {
      gameEngineRef.current = new GameEngine();
      setGameEngine(gameEngineRef.current);
    }

    return () => {
      if (gameEngineRef.current) {
        gameEngineRef.current.destroy();
        gameEngineRef.current = null;
      }
    };
  }, [setGameEngine]);

  return (
    <div className="relative w-full h-full">
      <GameCanvas gameEngine={gameEngineRef.current} />
      <GameUI />
    </div>
  );
}
