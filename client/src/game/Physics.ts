import { Player } from "./Player";
import { Enemy } from "./Enemy";
import { Level } from "./Level";
import { Rectangle } from "./types";

export class Physics {
  private gravity: number = 800;

  update(deltaTime: number, player: Player, enemies: Enemy[], level: Level) {
    // Update player physics
    this.updatePlayerPhysics(player, level);
    
    // Update enemy physics
    enemies.forEach(enemy => {
      this.updateEnemyPhysics(enemy, level);
    });
  }

  private updatePlayerPhysics(player: Player, level: Level) {
    const playerBounds: Rectangle = player.getBounds();
    const platforms = level.getPlatforms();
    const playerPos = player.getPosition();
    const playerVel = player.getVelocity();
    
    // Check ground collision
    let isGrounded = false;
    
    platforms.forEach(platform => {
      if (this.checkCollision(playerBounds, platform)) {
        // Player is touching a platform
        const overlapY = (playerBounds.y + playerBounds.height) - platform.y;
        
        if (overlapY > 0 && overlapY < 20 && playerVel.y >= 0) {
          // Player is landing on top of platform
          playerPos.y = platform.y - playerBounds.height / 2;
          playerVel.y = 0;
          isGrounded = true;
        }
      }
    });
    
    player.setGrounded(isGrounded);
    
    // World boundaries
    const worldBounds = level.getWorldBounds();
    
    if (playerPos.x < worldBounds.left) {
      playerPos.x = worldBounds.left;
      playerVel.x = 0;
    } else if (playerPos.x > worldBounds.right) {
      playerPos.x = worldBounds.right;
      playerVel.x = 0;
    }
    
    // No fall to death - just keep player in bounds
    if (playerPos.y > worldBounds.bottom) {
      playerPos.y = worldBounds.bottom;
      playerVel.y = 0;
    }
  }

  private updateEnemyPhysics(enemy: Enemy, level: Level) {
    const enemyBounds: Rectangle = enemy.getBounds();
    const enemyPos = enemy.getPosition();
    const enemyVel = enemy.getVelocity();
    const platforms = level.getPlatforms();
    
    // Check ground collision for non-flying enemies
    if (enemy.getType() !== 'flyer') {
      platforms.forEach(platform => {
        if (this.checkCollision(enemyBounds, platform)) {
          const overlapY = (enemyBounds.y + enemyBounds.height) - platform.y;

          if (overlapY > 0 && overlapY < 20 && enemyVel.y >= 0) {
            enemyPos.y = platform.y - enemyBounds.height / 2;
            enemyVel.y = 0;
          }
        }
      });
    }
    
    // World boundaries
    const worldBounds = level.getWorldBounds();
    
    if (enemyPos.x < worldBounds.left || enemyPos.x > worldBounds.right) {
      // Turn around at world boundaries
      enemyVel.x *= -1;
    }

    if (enemyPos.y > worldBounds.bottom + 100) {
      // Remove enemy if it falls too far
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
