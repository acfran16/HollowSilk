import { useEffect, useRef } from "react";
import { GameEngine } from "../game/GameEngine";

interface GameCanvasProps {
  gameEngine: GameEngine | null;
}

export default function GameCanvas({ gameEngine }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!gameEngine || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set up canvas
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      ctx.imageSmoothingEnabled = false;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Initialize game engine with canvas
    gameEngine.initialize(canvas, ctx);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [gameEngine]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full bg-black touch-none"
      style={{ 
        imageRendering: "pixelated",
        touchAction: "none"
      }}
    />
  );
}
