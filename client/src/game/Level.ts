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
    // Main ground level - aligned with buildings at y=420
    this.platforms.push(
      { x: -500, y: 420, width: 4000, height: 40, type: 'brick' }
    );

    // Mid-level brick platforms
    this.platforms.push(
      { x: 150, y: 320, width: 200, height: 30, type: 'brick' },
      { x: 450, y: 320, width: 150, height: 30, type: 'brick' },
      { x: 700, y: 320, width: 250, height: 30, type: 'brick' },
      { x: 1050, y: 320, width: 200, height: 30, type: 'brick' },
      { x: 1350, y: 320, width: 180, height: 30, type: 'brick' },
      { x: 1630, y: 320, width: 220, height: 30, type: 'brick' },
      { x: 1950, y: 320, width: 200, height: 30, type: 'brick' },
      { x: 2250, y: 320, width: 250, height: 30, type: 'brick' },
      { x: 2600, y: 320, width: 200, height: 30, type: 'brick' }
    );

    // Metal scaffolding platforms
    this.platforms.push(
      { x: 250, y: 220, width: 150, height: 25, type: 'metal' },
      { x: 500, y: 220, width: 200, height: 25, type: 'metal' },
      { x: 800, y: 220, width: 180, height: 25, type: 'metal' },
      { x: 1080, y: 220, width: 170, height: 25, type: 'metal' },
      { x: 1350, y: 220, width: 200, height: 25, type: 'metal' },
      { x: 1650, y: 220, width: 150, height: 25, type: 'metal' },
      { x: 1900, y: 220, width: 220, height: 25, type: 'metal' },
      { x: 2220, y: 220, width: 180, height: 25, type: 'metal' },
      { x: 2500, y: 220, width: 200, height: 25, type: 'metal' }
    );

    // Wooden construction platforms
    this.platforms.push(
      { x: 300, y: 120, width: 120, height: 20, type: 'wood' },
      { x: 520, y: 120, width: 140, height: 20, type: 'wood' },
      { x: 760, y: 120, width: 160, height: 20, type: 'wood' },
      { x: 1020, y: 120, width: 130, height: 20, type: 'wood' },
      { x: 1250, y: 120, width: 180, height: 20, type: 'wood' },
      { x: 1530, y: 120, width: 150, height: 20, type: 'wood' },
      { x: 1780, y: 120, width: 170, height: 20, type: 'wood' },
      { x: 2050, y: 120, width: 140, height: 20, type: 'wood' },
      { x: 2290, y: 120, width: 200, height: 20, type: 'wood' }
    );

    // Small connector platforms (concrete)
    this.platforms.push(
      { x: 370, y: 270, width: 80, height: 25, type: 'concrete' },
      { x: 620, y: 270, width: 80, height: 25, type: 'concrete' },
      { x: 870, y: 270, width: 80, height: 25, type: 'concrete' },
      { x: 1170, y: 270, width: 80, height: 25, type: 'concrete' },
      { x: 1470, y: 270, width: 80, height: 25, type: 'concrete' },
      { x: 1770, y: 270, width: 80, height: 25, type: 'concrete' },
      { x: 2070, y: 270, width: 80, height: 25, type: 'concrete' },
      { x: 2370, y: 270, width: 80, height: 25, type: 'concrete' }
    );

    // Obstacles for enemy navigation
    this.platforms.push(
      // Vertical barriers
      { x: 600, y: 390, width: 20, height: 30, type: 'obstacle' },
      { x: 950, y: 390, width: 20, height: 30, type: 'obstacle' },
      { x: 1300, y: 390, width: 20, height: 30, type: 'obstacle' },
      { x: 1800, y: 390, width: 20, height: 30, type: 'obstacle' },
      { x: 2400, y: 390, width: 20, height: 30, type: 'obstacle' },
      
      // Construction barriers
      { x: 750, y: 295, width: 25, height: 25, type: 'obstacle' },
      { x: 1150, y: 295, width: 25, height: 25, type: 'obstacle' },
      { x: 1550, y: 295, width: 25, height: 25, type: 'obstacle' },
      { x: 2150, y: 295, width: 25, height: 25, type: 'obstacle' }
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
        
        this.renderPlatformByType(ctx, platform);
      }
    });

    // Render environmental details
    this.renderEnvironmentalDetails(ctx, viewBounds);
  }

  private renderPlatformByType(ctx: CanvasRenderingContext2D, platform: Rectangle) {
    const type = platform.type || 'brick';
    
    switch (type) {
      case 'brick':
        this.renderBrickPlatform(ctx, platform);
        break;
      case 'metal':
        this.renderMetalPlatform(ctx, platform);
        break;
      case 'wood':
        this.renderWoodPlatform(ctx, platform);
        break;
      case 'concrete':
        this.renderConcretePlatform(ctx, platform);
        break;
      case 'obstacle':
        this.renderObstacle(ctx, platform);
        break;
      default:
        this.renderBrickPlatform(ctx, platform);
    }
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

  private renderMetalPlatform(ctx: CanvasRenderingContext2D, platform: Rectangle) {
    // Metal scaffolding appearance
    ctx.fillStyle = '#708090';
    ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    
    // Metal grid pattern
    ctx.strokeStyle = '#556B2F';
    ctx.lineWidth = 2;
    for (let x = platform.x; x < platform.x + platform.width; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, platform.y);
      ctx.lineTo(x, platform.y + platform.height);
      ctx.stroke();
    }
    
    // Metal highlights
    ctx.fillStyle = '#C0C0C0';
    ctx.fillRect(platform.x, platform.y, platform.width, 3);
    
    // Platform outline
    ctx.strokeStyle = '#2F4F4F';
    ctx.lineWidth = 2;
    ctx.strokeRect(platform.x, platform.y, platform.width, platform.height);
  }

  private renderWoodPlatform(ctx: CanvasRenderingContext2D, platform: Rectangle) {
    // Wood planks
    ctx.fillStyle = '#D2691E';
    ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    
    // Wood grain lines
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
      const y = platform.y + (platform.height / 4) * (i + 1);
      ctx.beginPath();
      ctx.moveTo(platform.x, y);
      ctx.lineTo(platform.x + platform.width, y);
      ctx.stroke();
    }
    
    // Wood planks separators
    ctx.strokeStyle = '#654321';
    ctx.lineWidth = 2;
    for (let x = platform.x + 40; x < platform.x + platform.width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, platform.y);
      ctx.lineTo(x, platform.y + platform.height);
      ctx.stroke();
    }
    
    // Platform outline
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 2;
    ctx.strokeRect(platform.x, platform.y, platform.width, platform.height);
  }

  private renderConcretePlatform(ctx: CanvasRenderingContext2D, platform: Rectangle) {
    // Concrete base
    ctx.fillStyle = '#696969';
    ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    
    // Concrete texture dots
    ctx.fillStyle = '#778899';
    for (let i = 0; i < platform.width * platform.height / 100; i++) {
      const x = platform.x + Math.random() * platform.width;
      const y = platform.y + Math.random() * platform.height;
      ctx.fillRect(x, y, 2, 2);
    }
    
    // Platform outline
    ctx.strokeStyle = '#2F2F2F';
    ctx.lineWidth = 2;
    ctx.strokeRect(platform.x, platform.y, platform.width, platform.height);
  }

  private renderObstacle(ctx: CanvasRenderingContext2D, platform: Rectangle) {
    // Orange and black warning stripes
    ctx.fillStyle = '#FF4500';
    ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    
    // Warning stripes
    ctx.fillStyle = '#000000';
    for (let i = 0; i < platform.width; i += 10) {
      if (Math.floor(i / 10) % 2 === 0) {
        ctx.fillRect(platform.x + i, platform.y, 5, platform.height);
      }
    }
    
    // Platform outline
    ctx.strokeStyle = '#FF0000';
    ctx.lineWidth = 3;
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
    
    // Background city buildings - aligned with ground at y=420
    const groundLevel = 420;
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
        const buildingY = groundLevel - building.height;
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
