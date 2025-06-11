export interface Vector2 {
  x: number;
  y: number;
}

export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface GameState {
  player: {
    health: number;
    maxHealth: number;
    comboCount: number;
    position: Vector2;
    velocity: Vector2;
    isGrounded: boolean;
    isDashing: boolean;
    isAttacking: boolean;
    facingDirection: number;
  };
  enemies: Array<{
    id: string;
    health: number;
    maxHealth: number;
    position: Vector2;
    velocity: Vector2;
    type: string;
    state: string;
  }>;
  camera: {
    x: number;
    y: number;
    shakeX: number;
    shakeY: number;
  };
  isPaused: boolean;
  isGameOver: boolean;
}

export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  gravity: number;
}

export interface AnimationFrame {
  x: number;
  y: number;
  width: number;
  height: number;
  duration: number;
}

export interface Animation {
  name: string;
  frames: AnimationFrame[];
  loop: boolean;
}

export interface HitBox {
  x: number;
  y: number;
  width: number;
  height: number;
  damage: number;
  knockback: Vector2;
}

export interface EnemyAI {
  type: 'patrol' | 'chase' | 'attack' | 'idle';
  patrolRange: number;
  detectionRange: number;
  attackRange: number;
  speed: number;
  attackCooldown: number;
  lastAttackTime: number;
}
