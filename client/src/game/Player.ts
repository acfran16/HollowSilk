import { Vector2, HitBox, Animation } from "./types";
import { InputManager } from "./InputManager";

export class Player {
  private position: Vector2;
  private velocity: Vector2;
  private health: number;
  private maxHealth: number;
  private size: Vector2;
  
  // Movement properties
  private speed: number = 250; // Slightly increased for a more realistic run speed
  private jumpForce: number = 500; // Increased for a more natural jump height
  private dashForce: number = 500;
  private dashCooldown: number = 0;
  private dashDuration: number = 0;
  private maxDashCooldown: number = 1.0;
  private maxDashDuration: number = 0.2;
  
  // Input state for physics to use
  private inputState: {
    moveLeft: boolean;
    moveRight: boolean;
    jump: boolean;
    dash: boolean;
  } = {
    moveLeft: false,
    moveRight: false,
    jump: false,
    dash: false,
  };
  
  // Combat properties
  private attackDamage: number = 25;
  private attackRange: number = 60;
  private attackCooldown: number = 0;
  private maxAttackCooldown: number = 0.5;
  private comboCount: number = 0;
  private comboTimer: number = 0;
  private maxComboTimer: number = 2.0;
  
  // State flags
  private _isGrounded: boolean = false;
  private _isDashing: boolean = false;
  private _isAttacking: boolean = false;
  private facingDirection: number = 1; // 1 for right, -1 for left
  
  // Animation
  private currentAnimation: string = 'idle';
  private animationTime: number = 0;

  constructor(startPosition: Vector2) {
    this.position = { ...startPosition };
    this.velocity = { x: 0, y: 0 };
    this.health = 100;
    this.maxHealth = 100;
    this.size = { x: 32, y: 48 };
  }

  update(deltaTime: number, input: InputManager) {
    // Update timers
    this.dashCooldown = Math.max(0, this.dashCooldown - deltaTime);
    this.dashDuration = Math.max(0, this.dashDuration - deltaTime);
    this.attackCooldown = Math.max(0, this.attackCooldown - deltaTime);
    this.comboTimer = Math.max(0, this.comboTimer - deltaTime);
    
    // Reset combo if timer expires
    if (this.comboTimer <= 0) {
      this.comboCount = 0;
    }
    
    // Update dash state
    this._isDashing = this.dashDuration > 0;
    
    // Handle input
    this.handleInput(input);
    
    // Update animation
    this.updateAnimation(deltaTime);
  }

  private handleInput(input: InputManager) {
    // Update input state for physics to use
    this.inputState.moveLeft = input.isKeyPressed('KeyA') || input.isKeyPressed('ArrowLeft');
    this.inputState.moveRight = input.isKeyPressed('KeyD') || input.isKeyPressed('ArrowRight');
    this.inputState.jump = input.isKeyJustPressed('Space') || input.isKeyJustPressed('KeyW') || input.isKeyJustPressed('ArrowUp');
    
    // Update facing direction and animation based on input
    if (input.isKeyPressed('KeyA') || input.isKeyPressed('ArrowLeft')) {
      this.facingDirection = -1;
      this.currentAnimation = this._isGrounded ? 'run' : 'jump';
    } else if (input.isKeyPressed('KeyD') || input.isKeyPressed('ArrowRight')) {
      this.facingDirection = 1;
      this.currentAnimation = this._isGrounded ? 'run' : 'jump';
    } else if (!this.inputState.moveLeft && !this.inputState.moveRight && !this._isDashing) {
      this.currentAnimation = 'idle';
 if (Math.abs(this.velocity.x) < 10) { this.velocity.x = 0; }
    }
    
    // Vertical movement for flying
    if ((input.isKeyJustPressed('Space') || input.isKeyJustPressed('KeyW') || input.isKeyJustPressed('ArrowUp')) && this._isGrounded) {
      this.velocity.y = -this.jumpForce;
      this._isGrounded = false; // Player is no longer grounded after jumping
    }

    // Reset vertical velocity if not grounded and not affected by external forces (like knockback)
    // This line is commented out to allow gravity to affect the player when not grounded.
    // if (!this._isGrounded && !this._isDashing && Math.abs(this.velocity.y) < 10) { this.velocity.y = 0; }
    
    // Dash (only horizontal for side-scrolling)
    if (
      (input.isKeyJustPressed('ShiftLeft') || input.isKeyJustPressed('ShiftRight')) &&
      this.dashCooldown <= 0
    ) {
      this.inputState.dash = true;
      this.dashDuration = this.maxDashDuration;
      this.dashCooldown = this.maxDashCooldown;
      this.currentAnimation = 'dash';
    } else {
      this.inputState.dash = false;
    }
    
    // Attack
    if ((input.isKeyJustPressed('KeyJ') || input.isKeyJustPressed('KeyX')) && this.attackCooldown <= 0) {
      this.performAttack();
    }
    
    // Special attack
    if ((input.isKeyJustPressed('KeyK') || input.isKeyJustPressed('KeyZ')) && this.attackCooldown <= 0 && this.comboCount >= 3) {
      this.performSpecialAttack();
    }
  }

  private performAttack() {
    this._isAttacking = true;
    this.attackCooldown = this.maxAttackCooldown;
    this.currentAnimation = 'attack';
    
    // Increment combo
    this.comboCount++;
    this.comboTimer = this.maxComboTimer;
    
    // Reset attack animation after a short delay
    setTimeout(() => {
      this._isAttacking = false;
    }, 200);
  }

  private performSpecialAttack() {
    this._isAttacking = true;
    this.attackCooldown = this.maxAttackCooldown * 1.5;
    this.currentAnimation = 'special_attack';
    
    // Special attacks reset combo but deal more damage
    this.comboCount = 0;
    
    setTimeout(() => {
      this._isAttacking = false;
    }, 400);
  }

  private updateAnimation(deltaTime: number) {
    this.animationTime += deltaTime;
  }

  render(ctx: CanvasRenderingContext2D) {
    ctx.save();

    // Translate to the player's position
    ctx.translate(this.position.x, this.position.y);

    // Flip sprite based on facing direction
    if (this.facingDirection === -1) {
      ctx.scale(-1, 1);
    }

    ctx.fillStyle = this._isDashing ? '#4488ff' : (this._isAttacking ? '#ff4444' : '#44ff44');
    ctx.fillRect(
      this.position.x - this.size.x / 2,
      this.position.y - this.size.y / 2,
      this.size.x,
      this.size.y
    );

    // Draw player rectangle (placeholder for sprite) centered at the origin after translation
    ctx.fillStyle = this._isDashing ? '#4488ff' : (this._isAttacking ? '#ff4444' : '#44ff44');
    ctx.fillRect(-this.size.x / 2, -this.size.y / 2, this.size.x, this.size.y);

    // Commented out health bar rendering
    /*
        // Draw health bar above player
        const healthBarWidth = 40;
        const healthBarHeight = 4;
        const healthPercentage = this.health / this.maxHealth;

        ctx.fillStyle = '#333';
        ctx.fillRect(
          this.position.x - healthBarWidth / 2,
          this.position.y - this.size.y / 2 - 10,
          healthBarWidth,
          healthBarHeight
        );

        ctx.fillStyle = healthPercentage > 0.5 ? '#44ff44' : (healthPercentage > 0.25 ? '#ffff44' : '#ff4444');
        ctx.fillRect(
          this.position.x - healthBarWidth / 2,
          this.position.y - this.size.y / 2 - 10,
          healthBarWidth * healthPercentage,
          healthBarHeight
        );
    */
    ctx.restore();

    // Draw attack hitbox when attacking
    if (this._isAttacking) { // Check if attacking to draw hitbox
      const hitbox = this.getAttackHitBox();
      ctx.strokeStyle = 'rgba(255, 255, 0, 0.5)';
      ctx.lineWidth = 2;
      ctx.strokeRect(hitbox.x, hitbox.y, hitbox.width, hitbox.height);
    }
  }

  getAttackHitBox(): HitBox {
    const damage = this.comboCount >= 3 && this.currentAnimation === 'special_attack' ? this.attackDamage * 2 : this.attackDamage;
    const range = this.comboCount >= 3 && this.currentAnimation === 'special_attack' ? this.attackRange * 1.5 : this.attackRange;
    
    return {
      x: this.position.x + (this.facingDirection === 1 ? this.size.x / 2 : -range - this.size.x / 2),
      y: this.position.y - this.size.y / 2,
      width: range,
      height: this.size.y,
      damage: damage,
      knockback: { x: this.facingDirection * 150, y: -50 }
    };
  }

  takeDamage(damage: number, knockback: Vector2) {
    this.health = Math.max(0, this.health - damage);
    this.velocity.x += knockback.x;
    this.velocity.y += knockback.y;
  }

  heal(amount: number) {
    this.health = Math.min(this.maxHealth, this.health + amount);
  }

  setGrounded(grounded: boolean) {
    this._isGrounded = grounded;
  }

  getBounds() {
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

  // Getters
  getPosition(): Vector2 { return this.position; }
  getVelocity(): Vector2 { return this.velocity; }
  getHealth(): number { return this.health; }
  getMaxHealth(): number { return this.maxHealth; }
  getComboCount(): number { return this.comboCount; }
  isGrounded(): boolean { return this._isGrounded; }
  isDashing(): boolean { return this._isDashing; }
  isAttacking(): boolean { return this._isAttacking; }
  getFacingDirection(): number { return this.facingDirection; }
  getInputState() { return this.inputState; }
  getSpeed(): number { return this.speed; }
  getJumpForce(): number { return this.jumpForce; }
  getDashForce(): number { return this.dashForce; }
}
