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
    const playerBounds = player.getBounds();
    const platforms = level.getPlatforms();
    
    // Check ground collision
    let isGrounded = false;
    
    platforms.forEach(platform => {
      if (this.checkCollision(playerBounds, platform)) {
        // Player is touching a platform
        const overlapY = (playerBounds.y + playerBounds.height) - platform.y;
        
        if (overlapY > 0 && overlapY < 20 && player.getVelocity().y >= 0) {
          // Player is landing on top of platform
          player.getPosition().y = platform.y - playerBounds.height / 2;
          player.getVelocity().y = 0;
          isGrounded = true;
        }
      }
    });
    
    player.setGrounded(isGrounded);
    
    // World boundaries
    const worldBounds = level.getWorldBounds();
    const pos = player.getPosition();
    
    if (pos.x < worldBounds.left) {
      pos.x = worldBounds.left;
      player.getVelocity().x = 0;
    } else if (pos.x > worldBounds.right) {
      pos.x = worldBounds.right;
      player.getVelocity().x = 0;
    }
    
    if (pos.y > worldBounds.bottom) {
      // Player fell off the world
      player.takeDamage(25, { x: 0, y: -200 });
      pos.y = worldBounds.bottom - 100;
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

  private checkCollision(rect1: Rectangle, rect2: Rectangle): boolean {
    return (
      rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.y + rect1.height > rect2.y
    );
  }
}
