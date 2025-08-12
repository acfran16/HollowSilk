export interface Vector2 {
  x: number;
  y: number;
}

export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
  type?: string;
  moving?: boolean;
  velocity?: Vector2;
}

export interface GameState {
  player: {
    health: number;
    maxHealth: number;
    energy: number;
    maxEnergy: number;
    comboCount: number;
    experience: number;
    level: number;
    position: Vector2;
    velocity: Vector2;
    isGrounded: boolean;
    isDashing: boolean;
    isAttacking: boolean;
    facingDirection: number;
    invulnerable: boolean;
    wallSliding: boolean;
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
  collectibles: Array<{
    id: string;
    type: 'health' | 'energy' | 'experience';
    position: Vector2;
    collected: boolean;
  }>;
  score: number;
  timeElapsed: number;
  isPaused: boolean;
  isGameOver: boolean;
  currentLevel: string;
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
  type?: 'spark' | 'smoke' | 'magic' | 'blood';
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
  type?: 'slash' | 'magic' | 'projectile';
}

export interface EnemyAI {
  type: 'patrol' | 'chase' | 'attack' | 'idle';
  patrolRange: number;
  detectionRange: number;
  attackRange: number;
  speed: number;
  attackCooldown: number;
  lastAttackTime: number;
  aggroLevel: number;
  lastKnownPlayerPosition?: Vector2;
}
}
