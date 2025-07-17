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
  private _isGrounded: boolean = false;
  private ai: EnemyAI;

  private patrolStartX: number;
  private targetPosition: Vector2 | null = null;
  private lastSeen: Vector2 | null = null;
  private alertTimer: number = 0;

  private animationTime: number = 0;
  private facingDirection: number = 1;

  constructor(startPosition: Vector2, enemyType: string) {
    this.id = Math.random().toString(36).substr(2, 9);
    this.position = { ...startPosition };
    this.velocity = { x: 0, y: 0 };
    this.type = enemyType;
    this.state = 'patrol';
    this.patrolStartX = startPosition.x;

    switch (enemyType) {
      case 'crawler':
        this.health = this.maxHealth = 50;
        this.size = { x: 32, y: 24 };
        this.ai = { type: 'patrol', patrolRange: 100, detectionRange: 80, attackRange: 40, speed: 60, attackCooldown: 1.5, lastAttackTime: 0 };
        break;
      case 'flyer':
        this.health = this.maxHealth = 30;
        this.size = { x: 28, y: 28 };
        this.ai = { type: 'chase', patrolRange: 150, detectionRange: 120, attackRange: 50, speed: 80, attackCooldown: 1.0, lastAttackTime: 0 };
        break;
      case 'guardian':
        this.health = this.maxHealth = 100;
        this.size = { x: 48, y: 64 };
        this.ai = { type: 'attack', patrolRange: 50, detectionRange: 150, attackRange: 80, speed: 40, attackCooldown: 2.0, lastAttackTime: 0 };
        break;
      default:
        this.health = this.maxHealth = 50;
        this.size = { x: 32, y: 32 };
        this.ai = { type: 'patrol', patrolRange: 100, detectionRange: 80, attackRange: 40, speed: 60, attackCooldown: 1.5, lastAttackTime: 0 };
    }
  }

  update(deltaTime: number, playerPosition: Vector2, platforms: any[] = []) {
    this.ai.lastAttackTime += deltaTime;
    this.alertTimer = Math.max(0, this.alertTimer - deltaTime);

    const dx = playerPosition.x - this.position.x;
    const dy = playerPosition.y - this.position.y;
    const distanceToPlayer = Math.sqrt(dx * dx + dy * dy);

    this.executeAIBehavior(deltaTime, playerPosition, distanceToPlayer, platforms);

    if (this.type !== 'flyer') {
      this.velocity.y += 800 * deltaTime;
    }

    const previousPosition = { ...this.position };
    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;

    this.handlePlatformCollision(platforms, previousPosition);
    this.animationTime += deltaTime;
  }

  render(ctx: CanvasRenderingContext2D) {
    ctx.save();
    if (this.facingDirection === -1) {
      ctx.scale(-1, 1);
      ctx.translate(-this.position.x * 2 - this.size.x, 0);
    }

    let color = '#ff6666';
    if (this.state === 'attacking') {
      color = this.type === 'guardian' ? '#ff8844' : '#ff4444';
    } else if (this.state === 'chasing' || this.state === 'searching') {
      color = '#ff4444';
    }

    ctx.fillStyle = color;
    ctx.fillRect(this.position.x - this.size.x / 2, this.position.y - this.size.y / 2, this.size.x, this.size.y);

    const healthBarWidth = Math.max(20, this.size.x);
    const healthPercentage = this.health / this.maxHealth;
    if (healthPercentage < 1) {
      ctx.fillStyle = '#333';
      ctx.fillRect(this.position.x - healthBarWidth / 2, this.position.y - this.size.y / 2 - 8, healthBarWidth, 3);
      ctx.fillStyle = healthPercentage > 0.5 ? '#44ff44' : healthPercentage > 0.25 ? '#ffff44' : '#ff4444';
      ctx.fillRect(this.position.x - healthBarWidth / 2, this.position.y - this.size.y / 2 - 8, healthBarWidth * healthPercentage, 3);
    }

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
    const damage = this.type === 'guardian' ? 35 : this.type === 'flyer' ? 15 : 20;
    const knockback = this.type === 'guardian' ? { x: this.facingDirection * 200, y: -100 } : { x: this.facingDirection * 100, y: -30 };
    return {
      x: this.position.x - this.ai.attackRange / 2,
      y: this.position.y - this.size.y / 2,
      width: this.ai.attackRange,
      height: this.size.y,
      damage,
      knockback
    };
  }

  takeDamage(damage: number, knockback: Vector2) {
    this.health = Math.max(0, this.health - damage);
    this.velocity.x += knockback.x * 0.5;
    this.velocity.y += knockback.y * 0.5;
    this.alertTimer = 5.0;
    this.state = 'chasing';
  }

  getBounds(): { x: number; y: number; width: number; height: number } {
    return {
      x: this.position.x - this.size.x / 2,
      y: this.position.y - this.size.y / 2,
      width: this.size.x,
      height: this.size.y
    };
  }

  getSize(): Vector2 {
    return { ...this.size };
  }

  private attackPlayer(playerPosition: Vector2) {
    this.velocity.x = 0;
    if (this.type === 'flyer') this.velocity.y = 0;
  }

  private checkForObstacle(direction: number, distance: number, platforms: any[] = []): boolean {
    const checkX = this.position.x + direction * distance;
    const checkY = this.position.y;
    for (const platform of platforms) {
      const bounds = platform.getBounds ? platform.getBounds() : platform;
      const inX = checkX >= bounds.x && checkX <= bounds.x + bounds.width;
      const inY = checkY >= bounds.y && checkY <= bounds.y + bounds.height;
      if (inX && inY) return true;
    }
    return false;
  }

  private executeAIBehavior(deltaTime: number, playerPosition: Vector2, distanceToPlayer: number, platforms: any[] = []) {
    switch (this.state) {
      case 'patrol': this.patrol(platforms); break;
      case 'chasing': this.chasePlayer(playerPosition, platforms); break;
      case 'searching': this.searchForPlayer(); break;
      case 'attacking': this.attackPlayer(playerPosition); break;
    }
  }

  getId() { return this.id; }
  getPosition() { return { ...this.position }; }
  getVelocity() { return { ...this.velocity }; }
  getHealth() { return this.health; }
  getMaxHealth() { return this.maxHealth; }
  getType() { return this.type; }
  getState() { return this.state; }
  isDead() { return this.health <= 0; }

  private get isGrounded() { return this._isGrounded; }

  private patrol(platforms: any[] = []) {
    const distanceFromStart = this.position.x - this.patrolStartX;
    const direction = this.velocity.x >= 0 ? 1 : -1;
    const obstacleAhead = this.checkForObstacle(direction, 50, platforms);

    if (obstacleAhead || Math.abs(distanceFromStart) >= this.ai.patrolRange) {
      this.velocity.x = -this.velocity.x || this.ai.speed * (Math.random() > 0.5 ? 1 : -1);
    } else if (this.isGrounded && Math.abs(this.velocity.x) < 1) {
      this.velocity.x = this.ai.speed * (Math.random() > 0.5 ? 1 : -1);
    }

    this.facingDirection = this.velocity.x > 0 ? 1 : -1;
  }

  private chasePlayer(playerPosition: Vector2, platforms: any[] = []) {
    const dx = playerPosition.x - this.position.x;
    const dy = playerPosition.y - this.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const direction = dx > 0 ? 1 : -1;

    const hasObstacle = this.checkForObstacle(direction, 40, platforms);

    if (hasObstacle && this.type !== 'flyer' && this.isGrounded) {
      this.velocity.y = -300;
    }

    this.velocity.x = (dx / distance) * this.ai.speed * (hasObstacle ? 0.3 : 1);

    if (this.type === 'flyer') {
      this.velocity.y = (dy / distance) * this.ai.speed;
    }

    this.facingDirection = this.velocity.x > 0 ? 1 : -1;
  }

 updateAIState(deltaTime: number, player: any, level: any) {
    this.ai.lastAttackTime += deltaTime;
    this.alertTimer = Math.max(0, this.alertTimer - deltaTime);

    const playerPosition = player.getPosition();
    const dx = playerPosition.x - this.position.x;
    const dy = playerPosition.y - this.position.y;
    const distanceToPlayer = Math.sqrt(dx * dx + dy * dy);

    const canSeePlayer = distanceToPlayer <= this.ai.detectionRange; // Simplistic line of sight for now

    switch (this.state) {
      case 'patrol':
        if (canSeePlayer) {
          this.state = 'chasing';
          this.lastSeen = { ...playerPosition };
        }
        break;
      case 'chasing':
        if (distanceToPlayer <= this.ai.attackRange && this.ai.lastAttackTime >= this.ai.attackCooldown) {
          this.state = 'attacking';
          this.ai.lastAttackTime = 0;
        } else if (!canSeePlayer && this.alertTimer <= 0) {
          this.state = 'searching';
        }
        this.lastSeen = { ...playerPosition }; // Update last seen position
        break;
      case 'searching':
        if (canSeePlayer) {
          this.state = 'chasing';
          this.lastSeen = { ...playerPosition };
        } else if (this.alertTimer <= 0) {
          this.state = 'patrol';
          this.lastSeen = null;
        }
        break;
      case 'attacking':
        if (distanceToPlayer > this.ai.attackRange) {
          this.state = 'chasing';
        } else if (this.ai.lastAttackTime >= this.ai.attackCooldown) {
           // Allow continuous attack if player stays in range
           this.ai.lastAttackTime = 0;
        }
        break;
    }
  }

  // Assuming a method to check line of sight could be added later,
  // potentially using raycasting against level geometry.
  // private checkLineOfSight(playerPosition: Vector2, level: any): boolean {
  //   // Raycasting logic here
  //   return true; // Placeholder
  // }

  private searchForPlayer() {
    if (this.lastSeen) {
      const dx = this.lastSeen.x - this.position.x;
      this.velocity.x = Math.abs(dx) > 10 ? (dx > 0 ? this.ai.speed * 0.5 : -this.ai.speed * 0.5) : 0;
      this.facingDirection = this.velocity.x > 0 ? 1 : -1;
    }
  }

  private handlePlatformCollision(platforms: any[], previousPosition: Vector2) {
    this._isGrounded = false;
    if (!platforms || this.type === 'flyer') return;

    for (const platform of platforms) {
      if (typeof platform.getVertices !== 'function') continue;
      const result = this.checkCollisionSAT(platform);
      if (result.collided && result.mtv) {
        this.position.x += result.mtv.x;
        this.position.y += result.mtv.y;

        if (Math.abs(result.mtv.y) > Math.abs(result.mtv.x)) {
          this.velocity.y = 0;
          if (result.mtv.y < 0) this._isGrounded = true;
        } else {
          this.velocity.x = 0;
        }
      }
    }
  }

  private getVertices(): Vector2[] {
    const hw = this.size.x / 2, hh = this.size.y / 2;
    const x = this.position.x, y = this.position.y;
    return [
      { x: x - hw, y: y - hh },
      { x: x + hw, y: y - hh },
      { x: x + hw, y: y + hh },
      { x: x - hw, y: y + hh }
    ];
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
