import { Player } from "./Player";
import { Enemy } from "./Enemy";
import { ParticleSystem } from "./ParticleSystem";
import { SoundManager } from "./SoundManager";
import { HitBox } from "./types";

export class Combat {
  private hitEffects: Array<{ x: number; y: number; life: number; maxLife: number; type: string }> = [];

  update(deltaTime: number, player: Player, enemies: Enemy[], particles: ParticleSystem, sound: SoundManager) {
    // Update hit effects
    this.hitEffects = this.hitEffects.filter(effect => {
      effect.life -= deltaTime;
      return effect.life > 0;
    });

    // Check player attacks against enemies
    if (player.isAttacking()) {
      const playerHitbox = player.getAttackHitBox();
      
      enemies.forEach(enemy => {
        if (enemy.isDead()) return;
        
        const enemyBounds = enemy.getBounds();
        
        if (this.checkCollision(playerHitbox, enemyBounds)) {
          // Deal damage to enemy
          enemy.takeDamage(playerHitbox.damage, playerHitbox.knockback);
          
          // Create hit effect
          this.createHitEffect(enemy.getPosition().x, enemy.getPosition().y, 'player_hit');
          
          // Create particles
          particles.createHitEffect(
            enemy.getPosition().x,
            enemy.getPosition().y,
            enemy.isDead() ? '#ff4444' : '#ffff44'
          );
          
          // Play sound
          sound.playSound(enemy.isDead() ? 'kill' : 'hit');
          
          // Screen shake
          if (enemy.isDead()) {
            // Stronger shake for kills
            this.requestScreenShake(10, 300);
          } else {
            this.requestScreenShake(5, 150);
          }
        }
      });
    }

    // Check enemy attacks against player
    enemies.forEach(enemy => {
      if (enemy.isDead()) return;
      
      const enemyHitbox = enemy.getAttackHitBox();
      if (!enemyHitbox) return;
      
      const playerBounds = player.getBounds();
      
      if (this.checkCollision(enemyHitbox, playerBounds)) {
        // Deal damage to player
        player.takeDamage(enemyHitbox.damage, enemyHitbox.knockback);
        
        // Create hit effect
        this.createHitEffect(player.getPosition().x, player.getPosition().y, 'enemy_hit');
        
        // Create particles
        particles.createHitEffect(
          player.getPosition().x,
          player.getPosition().y,
          '#ff6666'
        );
        
        // Play sound
        sound.playSound('player_hurt');
        
        // Screen shake
        this.requestScreenShake(8, 200);
      }
    });
  }

  private checkCollision(hitbox: HitBox, bounds: { x: number; y: number; width: number; height: number }): boolean {
    return (
      hitbox.x < bounds.x + bounds.width &&
      hitbox.x + hitbox.width > bounds.x &&
      hitbox.y < bounds.y + bounds.height &&
      hitbox.y + hitbox.height > bounds.y
    );
  }

  private createHitEffect(x: number, y: number, type: string) {
    this.hitEffects.push({
      x,
      y,
      life: 0.3,
      maxLife: 0.3,
      type
    });
  }

  private requestScreenShake(intensity: number, duration: number) {
    // Request screen shake from camera system
    // This is handled by the GameEngine's camera
  }

  render(ctx: CanvasRenderingContext2D) {
    // Render hit effects
    this.hitEffects.forEach(effect => {
      const alpha = effect.life / effect.maxLife;
      const size = (1 - alpha) * 20 + 10;
      
      ctx.save();
      ctx.globalAlpha = alpha;
      
      if (effect.type === 'player_hit') {
        ctx.fillStyle = '#ffff44';
      } else {
        ctx.fillStyle = '#ff6666';
      }
      
      ctx.beginPath();
      ctx.arc(effect.x, effect.y, size, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
    });
  }

  reset() {
    this.hitEffects = [];
  }
}
