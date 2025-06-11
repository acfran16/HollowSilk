import { Vector2 } from "./types";

export class Camera {
  public x: number = 0;
  public y: number = 0;
  public shakeX: number = 0;
  public shakeY: number = 0;
  
  private targetX: number = 0;
  private targetY: number = 0;
  private smoothness: number = 0.1;
  
  // Screen shake
  private shakeIntensity: number = 0;
  private shakeDuration: number = 0;
  private shakeTimer: number = 0;

  update(deltaTime: number, targetPosition: Vector2) {
    // Update target position
    this.targetX = targetPosition.x;
    this.targetY = targetPosition.y - 50; // Offset camera slightly up
    
    // Smooth camera movement
    this.x += (this.targetX - this.x) * this.smoothness;
    this.y += (this.targetY - this.y) * this.smoothness;
    
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
