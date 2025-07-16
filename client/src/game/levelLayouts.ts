// ✅ levelLayouts.ts
// Define platform layouts per level

import { Rectangle } from "./types";

export const levelLayouts: Record<string, Rectangle[]> = {
  tutorial: [
    { x: 0, y: 680, width: 2400, height: 60, type: "ground" },
    { x: 200, y: 560, width: 150, height: 20, type: "metal" },
    { x: 400, y: 480, width: 120, height: 20, type: "metal" },
    { x: 600, y: 380, width: 20, height: 180, type: "wall" },
    { x: 720, y: 400, width: 20, height: 160, type: "wall" },
    { x: 780, y: 430, width: 100, height: 20, type: "wood" },
    { x: 1000, y: 500, width: 80, height: 20, type: "metal" },
    { x: 1240, y: 500, width: 80, height: 20, type: "metal" },
    { x: 1400, y: 380, width: 100, height: 20, type: "wood" },
    { x: 1550, y: 300, width: 120, height: 20, type: "wood" },
    { x: 1750, y: 480, width: 20, height: 120, type: "wall" },
    { x: 1850, y: 380, width: 20, height: 220, type: "wall" },
    { x: 1950, y: 360, width: 200, height: 30, type: "goal" },
    { x: 900, y: 660, width: 80, height: 20, type: "hazard" },
    { x: 1700, y: 660, width: 100, height: 20, type: "hazard" },
  ],

  // future: dashZone, finalZone etc
};
