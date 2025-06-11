import { useEffect } from "react";
import Game from "./components/Game";
import { useGameState } from "./lib/stores/useGameState";

function App() {
  const { initializeGame } = useGameState();

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  return (
    <div className="w-full h-full bg-black overflow-hidden">
      <Game />
    </div>
  );
}

export default App;
