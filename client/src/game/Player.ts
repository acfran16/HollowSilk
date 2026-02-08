import { Vector2, HitBox, Animation } from "./types";
import { InputManager } from "./InputManager";
import { ParticleSystem } from "./ParticleSystem";

export class Player {
  private position: Vector2;
  private velocity: Vector2;
  private health: number;
  private maxHealth: number;
  private energy: number;
  private maxEnergy: number;
  private experience: number;
  private level: number;
  private size: Vector2;

  // Movement properties
  private speed: number = 250; // Slightly increased for a more realistic run speed
  private jumpForce: number = 500; // Increased for a more natural jump height
  private dashForce: number = 500;
  private dashCooldown: number = 0;
  private dashDuration: number = 0;
  private maxDashCooldown: number = 1.0;
  private maxDashDuration: number = 0.2;
  private wallSlideSpeed: number = 100;
  private wallJumpForce: Vector2 = { x: 300, y: 450 };
  private coyoteTime: number = 0.15;
  private coyoteTimer: number = 0;
  private jumpBufferTime: number = 0.1;
  private jumpBufferTimer: number = 0;

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
  private maxComboCount: number = 5;
  private comboMultiplier: number = 1.0;

  // State flags
  private _isGrounded: boolean = false;
  private _isDashing: boolean = false;
  private _isAttacking: boolean = false;
  private _invulnerable: boolean = false;
  private _wallSliding: boolean = false;
  private invulnerabilityTimer: number = 0;
  private maxInvulnerabilityTime: number = 1.0;
  private facingDirection: number = 1; // 1 for right, -1 for left
  private wasGrounded: boolean = false;
  private _canDoubleJump: boolean = true;

  // Animation
  private currentAnimation: string = 'idle';
  private animationTime: number = 0;

  constructor(startPosition: Vector2) {
    this.position = { ...startPosition };
    this.velocity = { x: 0, y: 0 };
    this.health = 100;
    this.maxHealth = 100;
    this.energy = 100;
    this.maxEnergy = 100;
    this.experience = 0;
    this.level = 1;
    this.size = { x: 32, y: 48 };
  }

  update(deltaTime: number, input: InputManager, particleSystem?: ParticleSystem) {
    // Update timers
    this.dashCooldown = Math.max(0, this.dashCooldown - deltaTime);
    this.dashDuration = Math.max(0, this.dashDuration - deltaTime);
    this.attackCooldown = Math.max(0, this.attackCooldown - deltaTime);
    this.comboTimer = Math.max(0, this.comboTimer - deltaTime);
    this.invulnerabilityTimer = Math.max(0, this.invulnerabilityTimer - deltaTime);
    this.coyoteTimer = Math.max(0, this.coyoteTimer - deltaTime);
    this.jumpBufferTimer = Math.max(0, this.jumpBufferTimer - deltaTime);

    // Update invulnerability
    this._invulnerable = this.invulnerabilityTimer > 0;

    // Regenerate energy
    if (this.energy < this.maxEnergy) {
      this.energy = Math.min(this.maxEnergy, this.energy + 30 * deltaTime);
    }

    // Coyote time - allow jumping shortly after leaving ground
    if (this.wasGrounded && !this._isGrounded) {
      this.coyoteTimer = this.coyoteTime;
    }
    this.wasGrounded = this._isGrounded;

    // Reset combo if timer expires
    if (this.comboTimer <= 0) {
      this.comboCount = 0;
      this.comboMultiplier = 1.0;
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

    // Jump buffering - store jump input for a short time
    if (input.isKeyJustPressed('Space') || input.isKeyJustPressed('KeyW') || input.isKeyJustPressed('ArrowUp')) {
      this.jumpBufferTimer = this.jumpBufferTime;
    }
    this.inputState.jump = this.jumpBufferTimer > 0;

    // Update facing direction and animation based on input
    if (this.inputState.moveLeft && !this.inputState.moveRight) {
      this.facingDirection = -1;
      this.currentAnimation = this._isGrounded ? 'run' : (this._wallSliding ? 'wall_slide' : 'jump');
    } else if (this.inputState.moveRight && !this.inputState.moveLeft) {
      this.facingDirection = 1;
      this.currentAnimation = this._isGrounded ? 'run' : (this._wallSliding ? 'wall_slide' : 'jump');
    } else if (!this.inputState.moveLeft && !this.inputState.moveRight && !this._isDashing) {
      this.currentAnimation = this._wallSliding ? 'wall_slide' : 'idle';
      if (Math.abs(this.velocity.x) < 10) { this.velocity.x = 0; }
    }

    // Vertical movement handled by Physics.ts
    // if ((input.isKeyJustPressed('Space') || input.isKeyJustPressed('KeyW') || input.isKeyJustPressed('ArrowUp')) && this._isGrounded) {
    //   this.velocity.y = -this.jumpForce;
    //   this._isGrounded = false; // Player is no longer grounded after jumping
    // }

    // Reset vertical velocity if not grounded and not affected by external forces (like knockback)
    // This line is commented out to allow gravity to affect the player when not grounded.
    // if (!this._isGrounded && !this._isDashing && Math.abs(this.velocity.y) < 10) { this.velocity.y = 0; }

    // Dash - costs energy
    if (
      (input.isKeyJustPressed('ShiftLeft') || input.isKeyJustPressed('ShiftRight')) &&
      this.dashCooldown <= 0 && this.energy >= 25
    ) {
      this.inputState.dash = true;
      this.dashDuration = this.maxDashDuration;
      this.dashCooldown = this.maxDashCooldown;
      this.energy -= 25;
      this.currentAnimation = 'dash';
      // Brief invulnerability during dash
      this.invulnerabilityTimer = this.maxDashDuration;

      // Visual effect
      if (particleSystem) {
        particleSystem.createDashEffect(this.position.x, this.position.y);
      }
    } else {
      this.inputState.dash = false;
    }

    // Attack
    if ((input.isKeyJustPressed('KeyJ') || input.isKeyJustPressed('KeyX')) && this.attackCooldown <= 0 && this.energy >= 10) {
      this.performAttack();
    }

    // Special attack
    if ((input.isKeyJustPressed('KeyK') || input.isKeyJustPressed('KeyZ')) && this.attackCooldown <= 0 && this.comboCount >= 3 && this.energy >= 30) {
      this.performSpecialAttack();
    }
  }

  private performAttack() {
    this._isAttacking = true;
    this.attackCooldown = this.maxAttackCooldown;
    this.energy -= 10;
    this.currentAnimation = 'attack';

    // Increment combo
    this.comboCount = Math.min(this.maxComboCount, this.comboCount + 1);
    this.comboTimer = this.maxComboTimer;
    this.comboMultiplier = 1.0 + (this.comboCount - 1) * 0.2;

    // Reset attack animation after a short delay
    setTimeout(() => {
      this._isAttacking = false;
    }, 200);
  }

  private performSpecialAttack() {
    this._isAttacking = true;
    this.attackCooldown = this.maxAttackCooldown * 1.5;
    this.energy -= 30;
    this.currentAnimation = 'special_attack';

    // Special attacks reset combo but deal more damage
    this.comboCount = 0;
    this.comboMultiplier = 1.0;

    setTimeout(() => {
      this._isAttacking = false;
    }, 400);
  }

  addExperience(amount: number) {
    this.experience += amount;
    const expNeeded = this.level * 100;
    if (this.experience >= expNeeded) {
      this.levelUp();
    }
  }

  private levelUp() {
    this.level++;
    this.experience = 0;

    // Increase stats on level up
    this.maxHealth += 20;
    this.health = this.maxHealth; // Full heal on level up
    this.maxEnergy += 10;
    this.energy = this.maxEnergy;
    this.attackDamage += 5;
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

    // Invulnerability flashing effect
    if (this._invulnerable && Math.floor(this.animationTime * 10) % 2 === 0) {
      ctx.globalAlpha = 0.5;
    }

    let playerColor = '#44ff44'; // Default green
    if (this._isDashing) playerColor = '#4488ff'; // Blue when dashing
    else if (this._isAttacking) playerColor = '#ff4444'; // Red when attacking
    else if (this._wallSliding) playerColor = '#ffaa44'; // Orange when wall sliding

    ctx.fillStyle = playerColor;
    ctx.fillRect(
      this.position.x - this.size.x / 2,
      this.position.y - this.size.y / 2,
      this.size.x,
      this.size.y
    );

    // Draw player rectangle (placeholder for sprite) centered at the origin after translation
    ctx.fillStyle = playerColor;
    ctx.fillRect(-this.size.x / 2, -this.size.y / 2, this.size.x, this.size.y);

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
    const baseDamage = this.comboCount >= 3 && this.currentAnimation === 'special_attack' ? this.attackDamage * 2 : this.attackDamage;
    const damage = Math.floor(baseDamage * this.comboMultiplier);
    const range = this.comboCount >= 3 && this.currentAnimation === 'special_attack' ? this.attackRange * 1.5 : this.attackRange;

    return {
      x: this.position.x + (this.facingDirection === 1 ? this.size.x / 2 : -range - this.size.x / 2),
      y: this.position.y - this.size.y / 2,
      width: range,
      height: this.size.y,
      damage: damage,
      knockback: { x: this.facingDirection * 150, y: -50 },
      type: this.currentAnimation === 'special_attack' ? 'magic' : 'slash'
    };
  }

  takeDamage(damage: number, knockback: Vector2) {
    if (this._invulnerable) return;

    this.health = Math.max(0, this.health - damage);
    this.velocity.x += knockback.x;
    this.velocity.y += knockback.y;

    // Become invulnerable after taking damage
    this.invulnerabilityTimer = this.maxInvulnerabilityTime;

    // Reset combo on taking damage
    this.comboCount = 0;
    this.comboMultiplier = 1.0;
  }

  heal(amount: number) {
    this.health = Math.min(this.maxHealth, this.health + amount);
  }

  restoreEnergy(amount: number) {
    this.energy = Math.min(this.maxEnergy, this.energy + amount);
  }

  setGrounded(grounded: boolean) {
    this._isGrounded = grounded;
    if (grounded) {
      this._canDoubleJump = true;
    }
  }

  setWallSliding(wallSliding: boolean) {
    this._wallSliding = wallSliding;
    if (wallSliding) {
      this._canDoubleJump = true;
    }
  }

  setCanDoubleJump(can: boolean) {
    this._canDoubleJump = can;
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
  getEnergy(): number { return this.energy; }
  getMaxEnergy(): number { return this.maxEnergy; }
  getExperience(): number { return this.experience; }
  getLevel(): number { return this.level; }
  getComboCount(): number { return this.comboCount; }
  getComboMultiplier(): number { return this.comboMultiplier; }
  isGrounded(): boolean { return this._isGrounded; }
  isDashing(): boolean { return this._isDashing; }
  isAttacking(): boolean { return this._isAttacking; }
  isInvulnerable(): boolean { return this._invulnerable; }
  isWallSliding(): boolean { return this._wallSliding; }
  getFacingDirection(): number { return this.facingDirection; }
  getInputState() { return this.inputState; }
  getSpeed(): number { return this.speed; }
  getJumpForce(): number { return this.jumpForce; }
  getDashForce(): number { return this.dashForce; }
  getCoyoteTimer(): number { return this.coyoteTimer; }
  getJumpBufferTimer(): number { return this.jumpBufferTimer; }
  getWallJumpForce(): Vector2 { return this.wallJumpForce; }
  canDoubleJump(): boolean { return this._canDoubleJump; }
}
