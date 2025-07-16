import { Vector2 } from "./types";

export class Camera {
  public x: number = 0;
  public y: number = 0;

  constructor(initialY?: number) {
    if (initialY !== undefined) this.y = initialY;
  }
  public shakeX: number = 0;
  public shakeY: number = 0;
  
  private targetX: number = 0;
  private targetY: number = 0;
  private smoothness: number = 0.1;
  
  // Screen shake
  private shakeIntensity: number = 0;
  private shakeDuration: number = 0;
  private shakeTimer: number = 0;

  update(deltaTime: number, targetPosition: Vector2, worldBounds: { left: number; right: number; top: number; bottom: number }) {
    this.targetX = targetPosition.x;
    this.targetY = targetPosition.y;

    // Smoother horizontal tracking for side-scrolling
    const horizontalSmoothness = 0.08;
    // Smoother vertical tracking
    const verticalSmoothness = 0.08;

    this.x += (this.targetX - this.x) * horizontalSmoothness;
    this.y += (this.targetY - this.y) * verticalSmoothness;

    // Clamp camera position to world bounds
    this.x = Math.max(worldBounds.left + window.innerWidth / 2, Math.min(worldBounds.right - window.innerWidth / 2, this.x));
    this.y = Math.max(worldBounds.top + window.innerHeight / 2, Math.min(worldBounds.bottom - window.innerHeight / 2, this.y));

    // Update screen shake
    this.updateScreenShake(deltaTime);
  }

  private updateScreenShake(deltaTime: number) {
    if (this.shakeTimer > 0) {
      this.shakeTimer -= deltaTime;
      
      // Calculate shake intensity based on remaining time
      const shakeStrength = (this.shakeTimer / this.shakeDuration) * this.shakeIntensity;
      
      // Generate random shake offset
      this.shakeX = (Math.random() - 0.5) * shakeStrength * 2;
      this.shakeY = (Math.random() - 0.5) * shakeStrength * 2;
      
      if (this.shakeTimer <= 0) {
        this.shakeX = 0;
        this.shakeY = 0;
      }
    }
  }

  shake(intensity: number, duration: number) {
    this.shakeIntensity = intensity;
    this.shakeDuration = duration / 1000; // Convert to seconds
    this.shakeTimer = this.shakeDuration;
  }

  getViewBounds() {
    return {
      left: this.x - window.innerWidth / 2,
      right: this.x + window.innerWidth / 2,
      top: this.y - window.innerHeight / 2,
      bottom: this.y + window.innerHeight / 2
    };
  }

  worldToScreen(worldPos: Vector2): Vector2 {
    return {
      x: worldPos.x - this.x + this.shakeX + window.innerWidth / 2,
      y: worldPos.y - this.y + this.shakeY + window.innerHeight / 2
    };
  }

  screenToWorld(screenPos: Vector2): Vector2 {
    return {
      x: screenPos.x + this.x - this.shakeX - window.innerWidth / 2,
      y: screenPos.y + this.y - this.shakeY - window.innerHeight / 2
    };
  }
}
