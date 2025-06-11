import { Vector2, EnemyAI, HitBox } from "./types";

export class Enemy {
  private id: string;
  private position: Vector2;
  private velocity: Vector2;
  private health: number;
  private maxHealth: number;
  private size: Vector2;
  private type: string;
  private state: string;
  private ai: EnemyAI;
  
  // AI state
  private patrolStartX: number;
  private targetPosition: Vector2 | null = null;
  private lastSeen: Vector2 | null = null;
  private alertTimer: number = 0;
  
  // Animation
  private animationTime: number = 0;
  private facingDirection: number = 1;

  constructor(startPosition: Vector2, enemyType: string) {
    this.id = Math.random().toString(36).substr(2, 9);
    this.position = { ...startPosition };
    this.velocity = { x: 0, y: 0 };
    this.type = enemyType;
    this.state = 'patrol';
    this.patrolStartX = startPosition.x;
    
    // Set properties based on enemy type
    switch (enemyType) {
      case 'crawler':
        this.health = 50;
        this.maxHealth = 50;
        this.size = { x: 32, y: 24 };
        this.ai = {
          type: 'patrol',
          patrolRange: 100,
          detectionRange: 80,
          attackRange: 40,
          speed: 60,
          attackCooldown: 1.5,
          lastAttackTime: 0
        };
        break;
      case 'flyer':
        this.health = 30;
        this.maxHealth = 30;
        this.size = { x: 28, y: 28 };
        this.ai = {
          type: 'chase',
          patrolRange: 150,
          detectionRange: 120,
          attackRange: 50,
          speed: 80,
          attackCooldown: 1.0,
          lastAttackTime: 0
        };
        break;
      case 'guardian':
        this.health = 100;
        this.maxHealth = 100;
        this.size = { x: 48, y: 64 };
        this.ai = {
          type: 'attack',
          patrolRange: 50,
          detectionRange: 150,
          attackRange: 80,
          speed: 40,
          attackCooldown: 2.0,
          lastAttackTime: 0
        };
        break;
      default:
        this.health = 50;
        this.maxHealth = 50;
        this.size = { x: 32, y: 32 };
        this.ai = {
          type: 'patrol',
          patrolRange: 100,
          detectionRange: 80,
          attackRange: 40,
          speed: 60,
          attackCooldown: 1.5,
          lastAttackTime: 0
        };
    }
  }

  update(deltaTime: number, playerPosition: Vector2) {
    // Update AI timers
    this.ai.lastAttackTime += deltaTime;
    this.alertTimer = Math.max(0, this.alertTimer - deltaTime);
    
    // Calculate distance to player
    const distanceToPlayer = Math.sqrt(
      Math.pow(playerPosition.x - this.position.x, 2) +
      Math.pow(playerPosition.y - this.position.y, 2)
    );
    
    // Update AI state based on player distance
    this.updateAIState(distanceToPlayer, playerPosition);
    
    // Execute AI behavior
    this.executeAIBehavior(deltaTime, playerPosition, distanceToPlayer);
    
    // Apply gravity (except for flyers)
    if (this.type !== 'flyer') {
      this.velocity.y += 600 * deltaTime;
    }
    
    // Update position
    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;
    
    // Update facing direction based on movement
    if (this.velocity.x > 0) this.facingDirection = 1;
    else if (this.velocity.x < 0) this.facingDirection = -1;
    
    // Update animation
    this.animationTime += deltaTime;
  }

  private updateAIState(distanceToPlayer: number, playerPosition: Vector2) {
    if (distanceToPlayer <= this.ai.detectionRange) {
      this.lastSeen = { ...playerPosition };
      this.alertTimer = 3.0; // Stay alert for 3 seconds after losing sight
      
      if (distanceToPlayer <= this.ai.attackRange && this.ai.lastAttackTime >= this.ai.attackCooldown) {
        this.state = 'attacking';
      } else if (distanceToPlayer <= this.ai.detectionRange) {
        this.state = 'chasing';
      }
    } else if (this.alertTimer > 0 && this.lastSeen) {
      this.state = 'searching';
    } else {
      this.state = 'patrol';
      this.lastSeen = null;
    }
  }

  private executeAIBehavior(deltaTime: number, playerPosition: Vector2, distanceToPlayer: number) {
    switch (this.state) {
      case 'patrol':
        this.patrol();
        break;
      case 'chasing':
        this.chasePlayer(playerPosition);
        break;
      case 'searching':
        this.searchForPlayer();
        break;
      case 'attacking':
        this.attackPlayer(playerPosition);
        break;
    }
  }

  private patrol() {
    // Enhanced patrol behavior with obstacle avoidance
    const distanceFromStart = this.position.x - this.patrolStartX;
    
    // Check for obstacles ahead
    const checkDistance = 50;
    const hasObstacleAhead = this.checkForObstacle(this.velocity.x > 0 ? 1 : -1, checkDistance);
    
    if (hasObstacleAhead) {
      // Reverse direction when hitting obstacle
      this.velocity.x *= -1;
    } else if (Math.abs(distanceFromStart) >= this.ai.patrolRange) {
      // Change direction when reaching patrol boundary
      this.velocity.x = distanceFromStart > 0 ? -this.ai.speed : this.ai.speed;
    } else if (Math.abs(this.velocity.x) < 10) {
      // Start moving if standing still
      this.velocity.x = Math.random() > 0.5 ? this.ai.speed : -this.ai.speed;
    }
  }

  private chasePlayer(playerPosition: Vector2) {
    const dx = playerPosition.x - this.position.x;
    const dy = playerPosition.y - this.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 0) {
      // Check for obstacles when chasing
      const direction = dx > 0 ? 1 : -1;
      const hasObstacle = this.checkForObstacle(direction, 40);
      
      if (hasObstacle && this.type !== 'flyer') {
        // Try to jump over obstacle or find alternate path
        if (this.isGrounded) {
          this.velocity.y = -200; // Jump
        }
        // Slow down horizontal movement when blocked
        this.velocity.x = (dx / distance) * this.ai.speed * 0.3;
      } else {
        this.velocity.x = (dx / distance) * this.ai.speed;
      }
      
      // Flyers can move vertically and avoid obstacles by flying over
      if (this.type === 'flyer') {
        if (hasObstacle) {
          // Fly higher to avoid obstacles
          this.velocity.y = Math.min((dy / distance) * this.ai.speed - 50, -30);
        } else {
          this.velocity.y = (dy / distance) * this.ai.speed;
        }
      }
    }
  }

  private searchForPlayer() {
    if (this.lastSeen) {
      const dx = this.lastSeen.x - this.position.x;
      const distance = Math.abs(dx);
      
      if (distance > 10) {
        this.velocity.x = dx > 0 ? this.ai.speed * 0.5 : -this.ai.speed * 0.5;
      } else {
        this.velocity.x = 0;
      }
    }
  }

  private attackPlayer(playerPosition: Vector2) {
    if (this.ai.lastAttackTime >= this.ai.attackCooldown) {
      this.ai.lastAttackTime = 0;
      
      // Different attack patterns based on enemy type
      switch (this.type) {
        case 'crawler':
          // Lunge attack
          const dx = playerPosition.x - this.position.x;
          this.velocity.x = dx > 0 ? this.ai.speed * 2 : -this.ai.speed * 2;
          break;
        case 'flyer':
          // Dive attack
          this.velocity.y = this.ai.speed * 1.5;
          break;
        case 'guardian':
          // Stomp attack
          this.velocity.y = -200;
          break;
      }
    }
  }

  render(ctx: CanvasRenderingContext2D) {
    ctx.save();
    
    // Flip sprite based on facing direction
    if (this.facingDirection === -1) {
      ctx.scale(-1, 1);
      ctx.translate(-this.position.x * 2 - this.size.x, 0);
    }
    
    // Choose color based on enemy type and state
    let color = '#ff6666';
    switch (this.type) {
      case 'crawler':
        color = this.state === 'attacking' ? '#ff4444' : '#ff6666';
        break;
      case 'flyer':
        color = this.state === 'attacking' ? '#4444ff' : '#6666ff';
        break;
      case 'guardian':
        color = this.state === 'attacking' ? '#ff8844' : '#ffaa66';
        break;
    }
    
    // Add alert indicator
    if (this.state === 'chasing' || this.state === 'attacking') {
      color = '#ff4444';
    }
    
    // Draw enemy
    ctx.fillStyle = color;
    ctx.fillRect(
      this.position.x - this.size.x / 2,
      this.position.y - this.size.y / 2,
      this.size.x,
      this.size.y
    );
    
    // Draw health bar
    const healthBarWidth = Math.max(20, this.size.x);
    const healthBarHeight = 3;
    const healthPercentage = this.health / this.maxHealth;
    
    if (healthPercentage < 1) {
      ctx.fillStyle = '#333';
      ctx.fillRect(
        this.position.x - healthBarWidth / 2,
        this.position.y - this.size.y / 2 - 8,
        healthBarWidth,
        healthBarHeight
      );
      
      ctx.fillStyle = healthPercentage > 0.5 ? '#44ff44' : (healthPercentage > 0.25 ? '#ffff44' : '#ff4444');
      ctx.fillRect(
        this.position.x - healthBarWidth / 2,
        this.position.y - this.size.y / 2 - 8,
        healthBarWidth * healthPercentage,
        healthBarHeight
      );
    }
    
    // Draw alert indicator
    if (this.state === 'chasing' || this.state === 'searching') {
      ctx.fillStyle = '#ffff44';
      ctx.beginPath();
      ctx.arc(this.position.x, this.position.y - this.size.y / 2 - 15, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.restore();
  }

  getAttackHitBox(): HitBox | null {
    if (this.state !== 'attacking') return null;
    
    let damage = 20;
    let knockback = { x: this.facingDirection * 100, y: -30 };
    
    switch (this.type) {
      case 'guardian':
        damage = 35;
        knockback = { x: this.facingDirection * 200, y: -100 };
        break;
      case 'flyer':
        damage = 15;
        knockback = { x: this.facingDirection * 80, y: -20 };
        break;
    }
    
    return {
      x: this.position.x - this.ai.attackRange / 2,
      y: this.position.y - this.size.y / 2,
      width: this.ai.attackRange,
      height: this.size.y,
      damage: damage,
      knockback: knockback
    };
  }

  takeDamage(damage: number, knockback: Vector2) {
    this.health = Math.max(0, this.health - damage);
    this.velocity.x += knockback.x * 0.5; // Enemies are heavier
    this.velocity.y += knockback.y * 0.5;
    
    // Become aggressive when hit
    this.alertTimer = 5.0;
    this.state = 'chasing';
  }

  getBounds() {
    return {
      x: this.position.x - this.size.x / 2,
      y: this.position.y - this.size.y / 2,
      width: this.size.x,
      height: this.size.y
    };
  }

  private checkForObstacle(direction: number, distance: number): boolean {
    // Check for obstacles in the given direction
    const checkX = this.position.x + (direction * distance);
    const checkY = this.position.y;
    const checkWidth = 10;
    const checkHeight = this.size.y;
    
    // Simple obstacle detection - check for significant elevation changes
    // This will be enhanced when level reference is available
    return false;
  }

  private get isGrounded(): boolean {
    // Simple ground check - will be enhanced with proper collision detection
    return this.velocity.y === 0;
  }

  // Getters
  getId(): string { return this.id; }
  getPosition(): Vector2 { return { ...this.position }; }
  getVelocity(): Vector2 { return { ...this.velocity }; }
  getHealth(): number { return this.health; }
  getMaxHealth(): number { return this.maxHealth; }
  getType(): string { return this.type; }
  getState(): string { return this.state; }
  isDead(): boolean { return this.health <= 0; }
}
