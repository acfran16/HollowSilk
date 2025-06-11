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
    // Main ground level - continuous brick platforms
    this.platforms.push(
      { x: -500, y: 380, width: 4000, height: 40 }
    );

    // Mid-level brick platforms
    this.platforms.push(
      { x: 150, y: 280, width: 200, height: 30 },
      { x: 450, y: 280, width: 150, height: 30 },
      { x: 700, y: 280, width: 250, height: 30 },
      { x: 1050, y: 280, width: 200, height: 30 },
      { x: 1350, y: 280, width: 180, height: 30 },
      { x: 1630, y: 280, width: 220, height: 30 },
      { x: 1950, y: 280, width: 200, height: 30 },
      { x: 2250, y: 280, width: 250, height: 30 },
      { x: 2600, y: 280, width: 200, height: 30 }
    );

    // Upper level platforms
    this.platforms.push(
      { x: 250, y: 180, width: 150, height: 30 },
      { x: 500, y: 180, width: 200, height: 30 },
      { x: 800, y: 180, width: 180, height: 30 },
      { x: 1080, y: 180, width: 170, height: 30 },
      { x: 1350, y: 180, width: 200, height: 30 },
      { x: 1650, y: 180, width: 150, height: 30 },
      { x: 1900, y: 180, width: 220, height: 30 },
      { x: 2220, y: 180, width: 180, height: 30 },
      { x: 2500, y: 180, width: 200, height: 30 }
    );

    // Top level platforms
    this.platforms.push(
      { x: 300, y: 80, width: 120, height: 30 },
      { x: 520, y: 80, width: 140, height: 30 },
      { x: 760, y: 80, width: 160, height: 30 },
      { x: 1020, y: 80, width: 130, height: 30 },
      { x: 1250, y: 80, width: 180, height: 30 },
      { x: 1530, y: 80, width: 150, height: 30 },
      { x: 1780, y: 80, width: 170, height: 30 },
      { x: 2050, y: 80, width: 140, height: 30 },
      { x: 2290, y: 80, width: 200, height: 30 }
    );

    // Small connector platforms
    this.platforms.push(
      { x: 370, y: 230, width: 80, height: 25 },
      { x: 620, y: 230, width: 80, height: 25 },
      { x: 870, y: 230, width: 80, height: 25 },
      { x: 1170, y: 230, width: 80, height: 25 },
      { x: 1470, y: 230, width: 80, height: 25 },
      { x: 1770, y: 230, width: 80, height: 25 },
      { x: 2070, y: 230, width: 80, height: 25 },
      { x: 2370, y: 230, width: 80, height: 25 }
    );
  }

  render(ctx: CanvasRenderingContext2D, camera: Camera) {
    const viewBounds = camera.getViewBounds();

    // Render background
    this.renderBackground(ctx, viewBounds);

    // Render brick platforms
    this.platforms.forEach(platform => {
      // Only render platforms that are visible
      if (platform.x + platform.width >= viewBounds.left &&
          platform.x <= viewBounds.right &&
          platform.y + platform.height >= viewBounds.top &&
          platform.y <= viewBounds.bottom) {
        
        this.renderBrickPlatform(ctx, platform);
      }
    });

    // Render environmental details
    this.renderEnvironmentalDetails(ctx, viewBounds);
  }

  private renderBrickPlatform(ctx: CanvasRenderingContext2D, platform: Rectangle) {
    // Draw brick texture
    const brickWidth = 30;
    const brickHeight = 15;
    
    // Platform base color
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    
    // Draw individual bricks
    for (let y = 0; y < platform.height; y += brickHeight) {
      for (let x = 0; x < platform.width; x += brickWidth) {
        const offsetX = (Math.floor(y / brickHeight) % 2) * (brickWidth / 2);
        const brickX = platform.x + x + offsetX;
        const brickY = platform.y + y;
        
        // Skip bricks that extend beyond platform
        if (brickX + brickWidth > platform.x + platform.width) continue;
        
        // Brick body
        ctx.fillStyle = '#CD853F';
        ctx.fillRect(brickX, brickY, brickWidth - 2, brickHeight - 2);
        
        // Brick highlights
        ctx.fillStyle = '#DEB887';
        ctx.fillRect(brickX, brickY, brickWidth - 2, 2);
        ctx.fillRect(brickX, brickY, 2, brickHeight - 2);
        
        // Brick shadows
        ctx.fillStyle = '#A0522D';
        ctx.fillRect(brickX + brickWidth - 4, brickY + 2, 2, brickHeight - 4);
        ctx.fillRect(brickX + 2, brickY + brickHeight - 4, brickWidth - 4, 2);
      }
    }
    
    // Platform outline
    ctx.strokeStyle = '#654321';
    ctx.lineWidth = 2;
    ctx.strokeRect(platform.x, platform.y, platform.width, platform.height);
  }

  private renderBackground(ctx: CanvasRenderingContext2D, viewBounds: any) {
    // City sunset gradient background
    const gradient = ctx.createLinearGradient(0, viewBounds.top, 0, viewBounds.bottom);
    gradient.addColorStop(0, '#ff6b35'); // Sunset orange
    gradient.addColorStop(0.3, '#f7931e'); // Orange
    gradient.addColorStop(0.6, '#ffd23f'); // Yellow
    gradient.addColorStop(0.8, '#ff8c42'); // Deep orange
    gradient.addColorStop(1, '#2d1b69'); // Dark purple bottom
    
    ctx.fillStyle = gradient;
    ctx.fillRect(viewBounds.left, viewBounds.top, viewBounds.right - viewBounds.left, viewBounds.bottom - viewBounds.top);

    // City silhouette buildings
    this.renderCityBuildings(ctx, viewBounds);
    
    // Industrial elements
    this.renderIndustrialElements(ctx, viewBounds);
  }

  private renderCityBuildings(ctx: CanvasRenderingContext2D, viewBounds: any) {
    ctx.fillStyle = '#1a1a2e';
    
    // Background city buildings - far layer
    const buildings = [
      { x: -200, width: 80, height: 120 },
      { x: -100, width: 60, height: 90 },
      { x: -20, width: 100, height: 150 },
      { x: 100, width: 70, height: 110 },
      { x: 200, width: 90, height: 130 },
      { x: 320, width: 60, height: 80 },
      { x: 400, width: 120, height: 160 },
      { x: 550, width: 80, height: 100 },
      { x: 650, width: 100, height: 140 },
      { x: 780, width: 70, height: 90 },
      { x: 880, width: 110, height: 170 },
      { x: 1020, width: 80, height: 110 },
      { x: 1130, width: 90, height: 120 },
      { x: 1250, width: 70, height: 95 },
      { x: 1350, width: 120, height: 150 },
      { x: 1500, width: 80, height: 100 },
      { x: 1600, width: 100, height: 130 },
      { x: 1730, width: 70, height: 85 },
      { x: 1830, width: 110, height: 160 },
      { x: 1970, width: 90, height: 110 },
      { x: 2090, width: 80, height: 120 },
      { x: 2200, width: 100, height: 140 },
      { x: 2330, width: 70, height: 90 },
      { x: 2430, width: 120, height: 170 },
      { x: 2580, width: 80, height: 100 },
      { x: 2680, width: 90, height: 115 }
    ];
    
    buildings.forEach(building => {
      if (building.x + building.width >= viewBounds.left && building.x <= viewBounds.right) {
        const buildingY = viewBounds.bottom - building.height;
        ctx.fillRect(building.x, buildingY, building.width, building.height);
        
        // Building windows
        ctx.fillStyle = '#ffd23f';
        for (let i = 0; i < Math.floor(building.height / 25); i++) {
          for (let j = 0; j < Math.floor(building.width / 15); j++) {
            if (Math.random() > 0.6) {
              ctx.fillRect(
                building.x + j * 15 + 3,
                buildingY + i * 25 + 5,
                8, 12
              );
            }
          }
        }
        ctx.fillStyle = '#1a1a2e';
      }
    });
  }

  private renderIndustrialElements(ctx: CanvasRenderingContext2D, viewBounds: any) {
    // Construction cranes and industrial elements
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 4;
    
    // Draw construction cranes at various positions
    const cranePositions = [300, 800, 1400, 2000, 2600];
    cranePositions.forEach(x => {
      if (x >= viewBounds.left && x <= viewBounds.right) {
        // Crane mast
        ctx.beginPath();
        ctx.moveTo(x, viewBounds.bottom - 200);
        ctx.lineTo(x, viewBounds.bottom - 50);
        ctx.stroke();
        
        // Crane arm
        ctx.beginPath();
        ctx.moveTo(x - 60, viewBounds.bottom - 180);
        ctx.lineTo(x + 80, viewBounds.bottom - 180);
        ctx.stroke();
        
        // Support cables
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, viewBounds.bottom - 180);
        ctx.lineTo(x - 40, viewBounds.bottom - 160);
        ctx.moveTo(x, viewBounds.bottom - 180);
        ctx.lineTo(x + 40, viewBounds.bottom - 160);
        ctx.stroke();
        ctx.lineWidth = 4;
      }
    });
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
