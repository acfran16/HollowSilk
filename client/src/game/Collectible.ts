import { Vector2 } from "./types";

export class Collectible {
  private id: string;
  private position: Vector2;
  private type: 'health' | 'energy' | 'experience';
  private value: number;
  private collected: boolean = false;
  private animationTime: number = 0;
  private bobOffset: number = 0;
  private glowIntensity: number = 0;

  constructor(position: Vector2, type: 'health' | 'energy' | 'experience', value: number = 0) {
    this.id = Math.random().toString(36).substr(2, 9);
    this.position = { ...position };
    this.type = type;
    this.value = value || this.getDefaultValue();
    this.bobOffset = Math.random() * Math.PI * 2; // Random starting phase for bobbing
  }

  private getDefaultValue(): number {
    switch (this.type) {
      case 'health': return 25;
      case 'energy': return 30;
      case 'experience': return 10;
      default: return 10;
    }
  }

  update(deltaTime: number) {
    if (this.collected) return;

    this.animationTime += deltaTime;
    
    // Bobbing animation
    this.position.y += Math.sin(this.animationTime * 3 + this.bobOffset) * 20 * deltaTime;
    
    // Glowing effect
    this.glowIntensity = (Math.sin(this.animationTime * 4) + 1) * 0.5;
  }

  render(ctx: CanvasRenderingContext2D) {
    if (this.collected) return;

    ctx.save();
    
    // Glow effect
    const glowSize = 8 + this.glowIntensity * 4;
    const gradient = ctx.createRadialGradient(
      this.position.x, this.position.y, 0,
      this.position.x, this.position.y, glowSize
    );
    
    let color = '#44ff44';
    let glowColor = 'rgba(68, 255, 68, 0.3)';
    
    switch (this.type) {
      case 'health':
        color = '#ff4444';
        glowColor = 'rgba(255, 68, 68, 0.3)';
        break;
      case 'energy':
        color = '#4444ff';
        glowColor = 'rgba(68, 68, 255, 0.3)';
        break;
      case 'experience':
        color = '#ffff44';
        glowColor = 'rgba(255, 255, 68, 0.3)';
        break;
    }
    
    gradient.addColorStop(0, glowColor);
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(
      this.position.x - glowSize,
      this.position.y - glowSize,
      glowSize * 2,
      glowSize * 2
    );
    
    // Main collectible
    ctx.fillStyle = color;
    ctx.beginPath();
    
    switch (this.type) {
      case 'health':
        // Draw a cross/plus shape
        ctx.fillRect(this.position.x - 2, this.position.y - 8, 4, 16);
        ctx.fillRect(this.position.x - 8, this.position.y - 2, 16, 4);
        break;
      case 'energy':
        // Draw a lightning bolt shape (simplified)
        ctx.moveTo(this.position.x - 4, this.position.y - 8);
        ctx.lineTo(this.position.x + 2, this.position.y - 2);
        ctx.lineTo(this.position.x - 2, this.position.y - 2);
        ctx.lineTo(this.position.x + 4, this.position.y + 8);
        ctx.lineTo(this.position.x - 2, this.position.y + 2);
        ctx.lineTo(this.position.x + 2, this.position.y + 2);
        ctx.closePath();
        ctx.fill();
        break;
      case 'experience':
        // Draw a star
        const spikes = 5;
        const outerRadius = 8;
        const innerRadius = 4;
        let rot = Math.PI / 2 * 3;
        const step = Math.PI / spikes;
        
        ctx.moveTo(this.position.x, this.position.y - outerRadius);
        for (let i = 0; i < spikes; i++) {
          const x = this.position.x + Math.cos(rot) * outerRadius;
          const y = this.position.y + Math.sin(rot) * outerRadius;
          ctx.lineTo(x, y);
          rot += step;
          
          const x2 = this.position.x + Math.cos(rot) * innerRadius;
          const y2 = this.position.y + Math.sin(rot) * innerRadius;
          ctx.lineTo(x2, y2);
          rot += step;
        }
        ctx.lineTo(this.position.x, this.position.y - outerRadius);
        ctx.closePath();
        ctx.fill();
        break;
    }
    
    ctx.restore();
  }

  checkCollision(playerBounds: { x: number; y: number; width: number; height: number }): boolean {
    if (this.collected) return false;

    const collectibleBounds = {
      x: this.position.x - 8,
      y: this.position.y - 8,
      width: 16,
      height: 16
    };

    return (
      playerBounds.x < collectibleBounds.x + collectibleBounds.width &&
      playerBounds.x + playerBounds.width > collectibleBounds.x &&
      playerBounds.y < collectibleBounds.y + collectibleBounds.height &&
      playerBounds.y + playerBounds.height > collectibleBounds.y
    );
  }

  collect(): { type: string; value: number } {
    if (this.collected) return { type: this.type, value: 0 };
    
    this.collected = true;
    return { type: this.type, value: this.value };
  }

  // Getters
  getId(): string { return this.id; }
  getPosition(): Vector2 { return { ...this.position }; }
  getType(): string { return this.type; }
  getValue(): number { return this.value; }
  isCollected(): boolean { return this.collected; }
}