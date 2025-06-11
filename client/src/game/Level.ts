import { Rectangle, Vector2 } from "./types";
import { Camera } from "./Camera";

export class Level {
  private platforms: Rectangle[] = [];
  private worldBounds = {
    left: -500,
    right: 3000,
    top: -500,
    bottom: 600
  };

  constructor() {
    this.generateLevel();
  }

  private generateLevel() {
    // Extended ground platforms for side-scrolling
    this.platforms.push(
      { x: -500, y: 400, width: 1000, height: 20 },
      { x: 600, y: 400, width: 800, height: 20 },
      { x: 1500, y: 400, width: 800, height: 20 },
      { x: 2400, y: 400, width: 600, height: 20 }
    );

    // Varied height platforms for platforming challenges
    this.platforms.push(
      { x: 200, y: 300, width: 200, height: 20 },
      { x: 500, y: 250, width: 250, height: 20 },
      { x: 850, y: 200, width: 200, height: 20 },
      { x: 1150, y: 300, width: 300, height: 20 },
      { x: 1550, y: 250, width: 200, height: 20 },
      { x: 1850, y: 300, width: 250, height: 20 },
      { x: 2200, y: 200, width: 200, height: 20 }
    );

    // Higher platforms for advanced traversal
    this.platforms.push(
      { x: 300, y: 150, width: 150, height: 20 },
      { x: 650, y: 100, width: 200, height: 20 },
      { x: 950, y: 50, width: 150, height: 20 },
      { x: 1300, y: 150, width: 250, height: 20 },
      { x: 1700, y: 100, width: 150, height: 20 },
      { x: 2000, y: 150, width: 200, height: 20 }
    );

    // Small jumping platforms
    this.platforms.push(
      { x: 450, y: 180, width: 100, height: 20 },
      { x: 750, y: 120, width: 100, height: 20 },
      { x: 1050, y: 180, width: 100, height: 20 },
      { x: 1450, y: 180, width: 100, height: 20 },
      { x: 1950, y: 120, width: 100, height: 20 }
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
