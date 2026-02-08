import { Rectangle, Vector2 } from "./types";
import { Camera } from "./Camera";
import { levelLayouts } from "./levelLayouts";

export class Level {
  private platforms: Rectangle[] = [];
  private worldBounds: { left: number; right: number; top: number; bottom: number };
  private canvasWidth: number;
  private canvasHeight: number;

  constructor(canvasWidth: number, canvasHeight: number, levelName: string = "tutorial") {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.worldBounds = this.calculateWorldBounds();
    const layout = levelLayouts[levelName] || levelLayouts["tutorial"];
    this.loadLevelFromLayout(layout.platforms);
    this.spawnPoint = layout.spawnPoint;
  }

  private spawnPoint: Vector2 = { x: 50, y: 600 };

  getSpawnPoint(): Vector2 {
    return this.spawnPoint;
  }

  private calculateWorldBounds() {
    return {
      left: 0,
      right: 2400,
      top: -400,
      bottom: this.canvasHeight - 100,
    };
  }

  private loadLevelFromLayout(layout: Rectangle[]) {
    this.platforms = layout.map(p => ({
      ...p,
      type: p.type || "ground",
    }));
  }

  update(deltaTime: number) {
    for (const platform of this.platforms) {
      if (platform.moving && platform.velocity) {
        platform.x += platform.velocity.x * deltaTime;
        platform.y += platform.velocity.y * deltaTime;
      }
    }
  }

  render(ctx: CanvasRenderingContext2D, camera: Camera) {
    const viewBounds = camera.getViewBounds();
    this.renderBackground(ctx);
    for (const platform of this.platforms) {
      if (this.isPlatformVisible(platform, viewBounds)) {
        this.renderPlatform(ctx, platform);
      }
    }
    this.renderAtmosphere(ctx, viewBounds);
  }

  private isPlatformVisible(p: Rectangle, view: any): boolean {
    return p.x + p.width >= view.left && p.x <= view.right && p.y + p.height >= view.top && p.y <= view.bottom;
  }

  private renderPlatform(ctx: CanvasRenderingContext2D, p: Rectangle) {
    const type = p.type || "ground";
    const colorMap: Record<string, string> = {
      ground: "#2a2a2a",
      metal: "#666666",
      wood: "#8B4513",
      wall: "#444444",
      hazard: "#FF4500",
      goal: "#00FF00",
    };
    ctx.fillStyle = colorMap[type] ?? "gray";
    ctx.fillRect(p.x, p.y, p.width, p.height);
  }

  private renderBackground(ctx: CanvasRenderingContext2D) {
    const h = ctx.canvas.height;
    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, "#1a1a2e");
    gradient.addColorStop(0.7, "#16213e");
    gradient.addColorStop(1, "#0f1419");
    ctx.fillStyle = gradient;
    // Draw a larger background rectangle that covers the entire world bounds vertically
    // and the canvas width horizontally within the camera's view.
    // Since the camera transform is applied in GameEngine's render, we draw relative to the world origin.
    ctx.fillRect(this.worldBounds.left, this.worldBounds.top, this.worldBounds.right - this.worldBounds.left, this.worldBounds.bottom - this.worldBounds.top);
  }

  private renderAtmosphere(ctx: CanvasRenderingContext2D, viewBounds: any) {
    ctx.fillStyle = 'rgba(100, 150, 200, 0.3)';
    const particleCount = 30;
    const time = Date.now() * 0.001;
    for (let i = 0; i < particleCount; i++) {
      const x = (i * 127 + time * 50) % (viewBounds.right - viewBounds.left) + viewBounds.left;
      const y = (i * 251 + time * 30) % this.canvasHeight;
      if (x >= viewBounds.left && x <= viewBounds.right) {
        ctx.beginPath();
        ctx.arc(x - viewBounds.left, y, 1, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  getPlatforms(): Rectangle[] {
    return this.platforms;
  }

  getWorldBounds() {
    return this.worldBounds;
  }

  isPointInPlatform(point: Vector2): boolean {
    return this.platforms.some(p => point.x >= p.x && point.x <= p.x + p.width && point.y >= p.y && point.y <= p.y + p.height);
  }

  getPlatformAt(point: Vector2): Rectangle | null {
    return this.platforms.find(p => point.x >= p.x && point.x <= p.x + p.width && point.y >= p.y && point.y <= p.y + p.height) || null;
  }

  isPointOnHazard(point: Vector2): boolean {
    return this.getPlatformAt(point)?.type === "hazard";
  }

  isPointOnGoal(point: Vector2): boolean {
    return this.getPlatformAt(point)?.type === "goal";
  }
}
