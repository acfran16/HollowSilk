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
    
    // Calculate player bounds after movement
    const playerBounds = {
      x: playerPos.x - playerSize.width / 2,
      y: playerPos.y - playerSize.height / 2,
      width: playerSize.width,
      height: playerSize.height,
    };
    
    // Check ground collision
    let isGrounded = false;
    
    platforms.forEach(platform => {
      if (this.checkCollision(playerBounds, platform)) {
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

  private updateEnemyPhysics(enemy: Enemy, level: Level) {
    const enemyBounds = enemy.getBounds();
    const platforms = level.getPlatforms();
    
    // Check ground collision for non-flying enemies
    if (enemy.getType() !== 'flyer') {
      platforms.forEach(platform => {
        if (this.checkCollision(enemyBounds, platform)) {
          const overlapY = (enemyBounds.y + enemyBounds.height) - platform.y;
          
          if (overlapY > 0 && overlapY < 20 && enemy.getVelocity().y >= 0) {
            enemy.getPosition().y = platform.y - enemyBounds.height / 2;
            enemy.getVelocity().y = 0;
          }
        }
      });
    }
    
    // World boundaries
    const worldBounds = level.getWorldBounds();
    const pos = enemy.getPosition();
    
    if (pos.x < worldBounds.left || pos.x > worldBounds.right) {
      // Turn around at world boundaries
      enemy.getVelocity().x *= -1;
    }
    
    if (pos.y > worldBounds.bottom + 100) {
      // Remove enemy if it falls too far
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