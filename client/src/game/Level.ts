import { Rectangle, Vector2 } from "./types";
import { Camera } from "./Camera";

export class Level {
  private platforms: Rectangle[] = [];
  private worldBounds = {
    left: -500,
    right: 2000,
    top: -500,
    bottom: 600
  };

  constructor() {
    this.generateLevel();
  }

  private generateLevel() {
    // Ground platforms
    this.platforms.push(
      { x: -500, y: 400, width: 800, height: 20 },
      { x: 400, y: 400, width: 400, height: 20 },
      { x: 900, y: 400, width: 600, height: 20 },
      { x: 1600, y: 400, width: 400, height: 20 }
    );

    // Mid-level platforms
    this.platforms.push(
      { x: 200, y: 300, width: 150, height: 20 },
      { x: 500, y: 250, width: 200, height: 20 },
      { x: 800, y: 200, width: 150, height: 20 },
      { x: 1100, y: 300, width: 200, height: 20 },
      { x: 1400, y: 250, width: 150, height: 20 }
    );

    // High platforms
    this.platforms.push(
      { x: 300, y: 150, width: 100, height: 20 },
      { x: 600, y: 100, width: 150, height: 20 },
      { x: 900, y: 50, width: 100, height: 20 },
      { x: 1200, y: 150, width: 200, height: 20 }
    );

    // Floating platforms
    this.platforms.push(
      { x: 450, y: 180, width: 80, height: 20 },
      { x: 750, y: 120, width: 80, height: 20 },
      { x: 1050, y: 180, width: 80, height: 20 }
    );
  }

  render(ctx: CanvasRenderingContext2D, camera: Camera) {
    const viewBounds = camera.getViewBounds();

    // Render background
    this.renderBackground(ctx, viewBounds);

    // Render platforms
    this.platforms.forEach(platform => {
      // Only render platforms that are visible
      if (platform.x + platform.width >= viewBounds.left &&
          platform.x <= viewBounds.right &&
          platform.y + platform.height >= viewBounds.top &&
          platform.y <= viewBounds.bottom) {
        
        // Platform main body
        ctx.fillStyle = '#333333';
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        
        // Platform top surface
        ctx.fillStyle = '#555555';
        ctx.fillRect(platform.x, platform.y, platform.width, 4);
        
        // Platform edges
        ctx.fillStyle = '#222222';
        ctx.fillRect(platform.x, platform.y, 2, platform.height);
        ctx.fillRect(platform.x + platform.width - 2, platform.y, 2, platform.height);
      }
    });

    // Render environmental details
    this.renderEnvironmentalDetails(ctx, viewBounds);
  }

  private renderBackground(ctx: CanvasRenderingContext2D, viewBounds: any) {
    // Gradient background
    const gradient = ctx.createLinearGradient(0, viewBounds.top, 0, viewBounds.bottom);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(0.5, '#16213e');
    gradient.addColorStop(1, '#0f0f23');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(viewBounds.left, viewBounds.top, viewBounds.right - viewBounds.left, viewBounds.bottom - viewBounds.top);

    // Parallax stars
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    for (let i = 0; i < 50; i++) {
      const x = (i * 123) % (viewBounds.right - viewBounds.left) + viewBounds.left;
      const y = (i * 456) % (viewBounds.bottom - viewBounds.top) + viewBounds.top;
      
      ctx.beginPath();
      ctx.arc(x, y, Math.random() * 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private renderEnvironmentalDetails(ctx: CanvasRenderingContext2D, viewBounds: any) {
    // Render some atmospheric effects
    ctx.fillStyle = 'rgba(100, 100, 150, 0.1)';
    
    // Floating dust particles
    for (let i = 0; i < 30; i++) {
      const x = (i * 234 + Date.now() * 0.01) % (viewBounds.right - viewBounds.left) + viewBounds.left;
      const y = (i * 567 + Date.now() * 0.005) % (viewBounds.bottom - viewBounds.top) + viewBounds.top;
      
      ctx.beginPath();
      ctx.arc(x, y, 1, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  getPlatforms(): Rectangle[] {
    return this.platforms;
  }

  getWorldBounds() {
    return this.worldBounds;
  }

  isPointInPlatform(point: Vector2): boolean {
    return this.platforms.some(platform => 
      point.x >= platform.x &&
      point.x <= platform.x + platform.width &&
      point.y >= platform.y &&
      point.y <= platform.y + platform.height
    );
  }
}
