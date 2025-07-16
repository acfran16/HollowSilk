import { Player } from "./Player";
import { Enemy } from "./Enemy";
import { Level } from "./Level";
import { Rectangle } from "./types";

export class Physics {
  private gravity: number = 800;

  update(deltaTime: number, player: Player, enemies: Enemy[], level: Level) {
    // Update player physics
    this.updatePlayerPhysics(deltaTime, player, level);

    // Update enemy physics - FIXED: Now passing deltaTime correctly
    enemies.forEach(enemy => {
      this.updateEnemyPhysics(deltaTime, enemy, level);
    });
  }

  // FIXED: Added deltaTime parameter to method signature
  private updatePlayerPhysics(deltaTime: number, player: Player, level: Level) {
    const platforms = level.getPlatforms();
    const playerPos = player.getPosition();
    const playerVel = player.getVelocity();
    
    // Apply gravity only when not grounded
    if (!player.isGrounded()) {
      playerVel.y += this.gravity * deltaTime; // FIXED: deltaTime now available
    }
    
    // Update position based on velocity
    playerPos.x += playerVel.x * deltaTime;
    playerPos.y += playerVel.y * deltaTime;
    
    // Get updated bounds after position change
    const playerBounds = player.getBounds();
    
    // Check ground collision
    let isGrounded = false;
    
    platforms.forEach(platform => {
      if (this.checkCollision(playerBounds, platform)) {
        // Check if player is falling onto platform from above
        if (
          playerVel.y > 0 && // Falling down
          playerBounds.y < platform.y && // Player center is above platform
          playerBounds.y + playerBounds.height > platform.y && // But bottom overlaps
          playerBounds.y + playerBounds.height < platform.y + platform.height // Not falling through
        ) {
          // Snap player to top of platform
          playerPos.y = platform.y - playerBounds.height / 2;
          playerVel.y = 0;
          isGrounded = true;
        }
      }
    });
    
    player.setGrounded(isGrounded);
    
    // World boundaries
    const worldBounds = level.getWorldBounds();
    
    // Horizontal boundaries
    if (playerPos.x - playerBounds.width / 2 < worldBounds.left) {
      playerPos.x = worldBounds.left + playerBounds.width / 2;
      playerVel.x = Math.max(0, playerVel.x);
    } else if (playerPos.x + playerBounds.width / 2 > worldBounds.right) {
      playerPos.x = worldBounds.right - playerBounds.width / 2;
      playerVel.x = Math.min(0, playerVel.x);
    }
    
    // Vertical boundaries
    if (playerPos.y + playerBounds.height / 2 > worldBounds.bottom) {
      playerPos.y = worldBounds.bottom - playerBounds.height / 2;
      playerVel.y = 0;
      player.setGrounded(true);
    }
  }

  // FIXED: Added deltaTime parameter to method signature
  private updateEnemyPhysics(deltaTime: number, enemy: Enemy, level: Level) {
    const enemyPos = enemy.getPosition();
    const enemyVel = enemy.getVelocity();
    
    // Apply gravity to non-flying enemies
    if (enemy.getType() !== 'flyer') {
      enemyVel.y += this.gravity * deltaTime;
    }
    
    // Update position
    enemyPos.x += enemyVel.x * deltaTime;
    enemyPos.y += enemyVel.y * deltaTime;
    
    const enemyBounds = enemy.getBounds();
    const platforms = level.getPlatforms();
    
    // Check ground collision for non-flying enemies
    if (enemy.getType() !== 'flyer') {
      platforms.forEach(platform => {
        if (this.checkCollision(enemyBounds, platform)) {
          if (
            enemyVel.y > 0 &&
            enemyBounds.y < platform.y &&
            enemyBounds.y + enemyBounds.height > platform.y
          ) {
            enemyPos.y = platform.y - enemyBounds.height / 2;
            enemyVel.y = 0;
          }
        }
      });
    }
    
    // World boundaries
    const worldBounds = level.getWorldBounds();
    
    if (enemyPos.x - enemyBounds.width / 2 < worldBounds.left) {
      enemyPos.x = worldBounds.left + enemyBounds.width / 2;
      enemyVel.x = Math.abs(enemyVel.x);
    } else if (enemyPos.x + enemyBounds.width / 2 > worldBounds.right) {
      enemyPos.x = worldBounds.right - enemyBounds.width / 2;
      enemyVel.x = -Math.abs(enemyVel.x);
    }
    
    if (enemyPos.y > worldBounds.bottom + 100) {
      enemy.takeDamage(1000, { x: 0, y: 0 });
    }
  }

  private checkCollision(rect1: Rectangle, rect2: Rectangle): boolean {
    return (
      rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.y + rect1.height > rect2.y
    );
  }
}