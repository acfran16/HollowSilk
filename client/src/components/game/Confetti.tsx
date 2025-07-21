import { useEffect, useState } from "react";
import ReactConfetti from "react-confetti";

export function Confetti() {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    function update() {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return <ReactConfetti width={size.width} height={size.height} />;
}
