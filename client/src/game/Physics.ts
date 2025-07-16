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

  private updatePlayerPhysics(deltaTime: number, player: Player, level: Level) {
    const platforms = level.getPlatforms();
    const playerPos = player.getPosition();
    const playerSize = player.getSize();
    const playerVel = player.getVelocity();

    // Apply gravity only when not grounded
    if (!player.isGrounded()) {
      playerVel.y += this.gravity * deltaTime; // deltaTime now available
    }

    // Update position based on velocity
    playerPos.x += playerVel.x * deltaTime; // Fixed: Use deltaTime here
    playerPos.y += playerVel.y * deltaTime;
    
    // Check ground collision
    let isGrounded = false;
    
    platforms.forEach(platform => {
      if (this.checkCollision(playerBounds, platform)) {
        // Recalculate player bounds after horizontal movement
        const playerBounds = {
          x: playerPos.x - playerSize.width / 2,
          y: playerPos.y - playerSize.height / 2,
          width: playerSize.width,
          height: playerSize.height,
        };

        // Check if player is falling onto platform from above
        if (
          playerVel.y > 0 && // Falling down
          playerBounds.y + playerBounds.height > platform.y && // Bottom of player is below platform top
          playerBounds.y < platform.y + platform.height // Top of player is above platform bottom
        ) {
          // Snap player to top of platform
          playerPos.y = platform.y - playerSize.height / 2;
          playerVel.y = 0;
          isGrounded = true;
        }
      }
    });
    
    player.setGrounded(isGrounded); // Use corrected variable name
    
    // World boundaries
    const worldBounds = level.getWorldBounds();
    
    // Horizontal boundaries
    if (playerPos.x - playerSize.width / 2 < worldBounds.left) {
      playerPos.x = worldBounds.left + playerSize.width / 2;
      playerVel.x = Math.max(0, playerVel.x);
    } else if (playerPos.x + playerSize.width / 2 > worldBounds.right) {
      playerPos.x = worldBounds.right - playerSize.width / 2;
      playerVel.x = Math.min(0, playerVel.x);
    }
    
    // Vertical boundaries
    if (playerPos.y + playerSize.height / 2 > worldBounds.bottom) {
      playerPos.y = worldBounds.bottom - playerSize.height / 2;
      playerVel.y = 0;
      player.setGrounded(true);
    }
  }

  private updateEnemyPhysics(deltaTime: number, enemy: Enemy, level: Level) {
    enemyPos.x += enemyVel.x * deltaTime;
    enemyPos.y += enemyVel.y * deltaTime;
    
    const platforms = level.getPlatforms();
    
    // Check ground collision for non-flying enemies
    if (enemy.getType() !== 'flyer') {
      platforms.forEach(platform => {
        if (this.checkCollision(enemy.getBounds(), platform)) {
          if (
            enemyVel.y > 0 &&
            enemyBounds.y + enemyBounds.height > platform.y && // Bottom of enemy is below platform top
            enemyBounds.y < platform.y + platform.height // Top of enemy is above platform bottom
          ) {
            // Snap enemy to top of platform
            enemyPos.y = platform.y - enemySize.height / 2;
            enemyVel.y = 0;
          }
           // Handle collision from below or sides if needed
           // This simplified example only handles landing on platforms
        } else if (enemyVel.y < 0 && this.checkCollision(enemyBounds, platform)) {
            // Collision from below
        }
      });
    }
    
    // World boundaries
    const worldBounds = level.getWorldBounds();
    
    // Horizontal boundaries
    if (enemyPos.x - enemySize.width / 2 < worldBounds.left) {
      enemyPos.x = worldBounds.left + enemySize.width / 2;
      enemyVel.x = Math.abs(enemyVel.x);
    } else if (enemyPos.x + enemySize.width / 2 > worldBounds.right) {
      enemyPos.x = worldBounds.right - enemySize.width / 2;
      enemyVel.x = -Math.abs(enemyVel.x);
    }

    // Vertical boundaries (simple check for falling out of bounds)
    if (enemyPos.y > worldBounds.bottom + 100) {
      // Trigger enemy removal or respawn
      enemy.takeDamage(1000, { x: 0, y: 0 });
    }
  }

  // Helper function to check collision between two rectangles
  private checkCollision(rect1: Rectangle, rect2: Rectangle): boolean {
    return (
      rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.y + rect1.height > rect2.y
    );
  }
}