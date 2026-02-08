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
    enemies: {
        id: string;
        health: number;
        maxHealth: number;
        position: Vector2;
        velocity: Vector2;
        type: string;
        state: string;
    }[];
    camera: {
        x: number;
        y: number;
        shakeX: number;
        shakeY: number;
    };
    collectibles: {
        id: string;
        type: 'health' | 'energy' | 'experience';
        position: Vector2;
        collected: boolean;
    }[];
    score: number;
    timeElapsed: number;
    isPaused: boolean;
    isGameOver: boolean;
    currentLevel: string;
}

export interface EnemyAI {
    type: 'patrol' | 'chase' | 'attack';
    patrolRange: number; // Max distance from start position
    detectionRange: number; // Range to spot player
    attackRange: number; // Range to initiate attack
    speed: number;
    attackCooldown: number;
    lastAttackTime: number;
}

export interface HitBox {
    x: number;
    y: number;
    width: number;
    height: number;
    damage: number;
    knockback: Vector2;
    type?: string; // Added optional type for combat system
}

export interface Animation {
    name: string;
    duration: number;
    frames: number;
    loop: boolean;
}
