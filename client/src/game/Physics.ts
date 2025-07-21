import { Player } from "./Player";
import { Enemy } from "./Enemy";
import { Level } from "./Level";
import { Rectangle } from "./types";

export class Physics {
  private gravity: number = 800;
  private friction: number = 0.8;

  update(deltaTime: number, player: Player, enemies: Enemy[], level: Level) {
    // Update player physics
    this.updatePlayerPhysics(deltaTime, player, level);

    // Update enemy physics
    enemies.forEach(enemy => {
      this.updateEnemyPhysics(deltaTime, enemy, level);
    });
  }

  private updatePlayerPhysics(deltaTime: number, player: Player, level: Level) {
    const platforms = level.getPlatforms();
    const playerPos = player.getPosition();
    const playerSize = player.getSize();
    const playerVel = player.getVelocity();

    // Store previous position
    const prevPos = { x: playerPos.x, y: playerPos.y };

    // Apply gravity only when not grounded
    if (!player.isGrounded()) {
      playerVel.y += this.gravity * deltaTime;
    }

    // Update position based on velocity
    playerPos.x += playerVel.x * deltaTime;
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
        } else if (minOverlap === overlapBottom && playerVel.y < 0) {
          // Collision from bottom (player hitting platform from below)
          playerPos.y = platform.y + platform.height + playerSize.y / 2;
          playerVel.y = 0;
        } else if (minOverlap === overlapLeft && playerVel.x > 0) {
          // Collision from left
          playerPos.x = platform.x - playerSize.x / 2;
          playerVel.x = 0;
        } else if (minOverlap === overlapRight && playerVel.x < 0) {
          // Collision from right
          playerPos.x = platform.x + platform.width + playerSize.x / 2;
          playerVel.x = 0;
        }
      }
    });
    
    player.setGrounded(isGrounded);
    
    // Apply friction when grounded and not dashing
    if (isGrounded && !player.isDashing()) {
      playerVel.x *= this.friction;
    }
    
    // World boundaries
    const worldBounds = level.getWorldBounds();
    
    // Horizontal boundaries
    if (playerPos.x - playerSize.x / 2 < worldBounds.left) {
      playerPos.x = worldBounds.left + playerSize.x / 2;
      playerVel.x = Math.max(0, playerVel.x);
    } else if (playerPos.x + playerSize.x / 2 > worldBounds.right) {
      playerPos.x = worldBounds.right - playerSize.x / 2;
      playerVel.x = Math.min(0, playerVel.x);
    }
    
    // Vertical boundaries
    if (playerPos.y + playerSize.y / 2 > worldBounds.bottom) {
      playerPos.y = worldBounds.bottom - playerSize.y / 2;
      playerVel.y = 0;
      player.setGrounded(true);
    }
  }

  private updateEnemyPhysics(deltaTime: number, enemy: Enemy, level: Level) {
    const platforms = level.getPlatforms();
    const enemyPos = enemy.getPosition();
    const enemySize = enemy.getSize();
    const enemyVel = enemy.getVelocity();

    // Apply gravity
    enemyVel.y += this.gravity * deltaTime;

    // Update position
    enemyPos.x += enemyVel.x * deltaTime;
    enemyPos.y += enemyVel.y * deltaTime;

    const enemyBounds = {
      x: enemyPos.x - enemySize.x / 2,
      y: enemyPos.y - enemySize.y / 2,
      width: enemySize.x,
      height: enemySize.y,
    };

    const worldBounds = level.getWorldBounds();

    let isGrounded = false;
    
    if (enemy.getType() !== 'flyer') {
      platforms.forEach(platform => {
        if (this.checkCollision(enemyBounds, platform)) {
          // Calculate overlaps
          const overlapLeft = (enemyBounds.x + enemyBounds.width) - platform.x;
          const overlapRight = (platform.x + platform.width) - enemyBounds.x;
          const overlapTop = (enemyBounds.y + enemyBounds.height) - platform.y;
          const overlapBottom = (platform.y + platform.height) - enemyBounds.y;

          // Find minimum overlap to determine collision side
          const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

          if (minOverlap === overlapTop && enemyVel.y > 0) {
            // Collision from top (enemy falling onto platform)
            enemyPos.y = platform.y - enemySize.y / 2;
            enemyVel.y = 0;
            isGrounded = true;
          } else if (minOverlap === overlapBottom && enemyVel.y < 0) {
            // Collision from bottom
            enemyPos.y = platform.y + platform.height + enemySize.y / 2;
            enemyVel.y = 0;
          } else if (minOverlap === overlapLeft && enemyVel.x > 0) {
            // Collision from left
            enemyPos.x = platform.x - enemySize.x / 2;
            enemyVel.x = -enemyVel.x; // Reverse direction for enemies
          } else if (minOverlap === overlapRight && enemyVel.x < 0) {
            // Collision from right
            enemyPos.x = platform.x + platform.width + enemySize.x / 2;
            enemyVel.x = -enemyVel.x; // Reverse direction for enemies
          }
        }
      });
    }
    
    enemy.setGrounded(isGrounded);
    
    // Apply friction when grounded
    if (isGrounded && enemy.getType() !== 'flyer') {
      enemyVel.x *= this.friction;
    }
    
    // World boundaries
    
    // Horizontal boundaries - reverse direction for enemies
    if (enemyPos.x - enemySize.x / 2 < worldBounds.left) {
      enemyPos.x = worldBounds.left + enemySize.x / 2;
      enemyVel.x = Math.abs(enemyVel.x); // Move right
    } else if (enemyPos.x + enemySize.x / 2 > worldBounds.right) {
      enemyPos.x = worldBounds.right - enemySize.x / 2;
      enemyVel.x = -Math.abs(enemyVel.x); // Move left
    }
    
    // Vertical boundaries
    if (enemyPos.y + enemySize.y / 2 > worldBounds.bottom) {
      enemyPos.y = worldBounds.bottom - enemySize.y / 2;
      enemyVel.y = 0;
      enemy.setGrounded(true);
    }
    
    // Remove enemy if it falls too far below the world
    if (enemyPos.y > worldBounds.bottom + 200) {
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