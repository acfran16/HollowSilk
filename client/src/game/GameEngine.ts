import { Player } from "./Player";
import { Enemy } from "./Enemy";
import { Camera } from "./Camera";
import { ParticleSystem } from "./ParticleSystem";
import { Level } from "./Level";
import { InputManager } from "./InputManager";
import { AnimationSystem } from "./AnimationSystem";
import { SoundManager } from "./SoundManager";
import { Combat } from "./Combat";
import { Physics } from "./Physics";
import { Vector2, GameState } from "./types";

export class GameEngine {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private player: Player;
  private enemies: Enemy[] = [];
  private camera: Camera;
  private particleSystem: ParticleSystem;
  private level: Level;
  private inputManager: InputManager;
  private animationSystem: AnimationSystem;
  private soundManager: SoundManager;
  private combat: Combat;
  private physics: Physics;
  
  private lastTime = 0;
  private gameLoop: number = 0;
  private isRunning = false;
  private isPaused = false;

  // Game state callbacks
  private stateUpdateCallbacks: ((state: GameState) => void)[] = [];

  constructor() {
    this.inputManager = new InputManager();
    this.camera = new Camera();
    this.particleSystem = new ParticleSystem();
    this.level = new Level();
    this.animationSystem = new AnimationSystem();
    this.soundManager = new SoundManager();
    this.combat = new Combat();
    this.physics = new Physics();
    
    // Initialize player at center of screen
    this.player = new Player({ x: 400, y: 300 });
    
    // Initialize some enemies
    this.initializeEnemies();
  }

  initialize(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    this.canvas = canvas;
    this.ctx = ctx;
    
    this.inputManager.initialize();
    this.soundManager.initialize();
    
    this.start();
  }

  private initializeEnemies() {
    // Create various enemy types
    this.enemies = [
      new Enemy({ x: 600, y: 300 }, 'crawler'),
      new Enemy({ x: 800, y: 200 }, 'flyer'),
      new Enemy({ x: 1000, y: 350 }, 'guardian'),
      new Enemy({ x: 1200, y: 300 }, 'crawler'),
    ];
  }

  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.lastTime = performance.now();
    this.gameLoop = requestAnimationFrame(this.update.bind(this));
  }

  pause() {
    this.isPaused = !this.isPaused;
  }

  stop() {
    this.isRunning = false;
    if (this.gameLoop) {
      cancelAnimationFrame(this.gameLoop);
    }
  }

  destroy() {
    this.stop();
    this.inputManager.destroy();
    this.soundManager.destroy();
  }

  onStateUpdate(callback: (state: GameState) => void) {
    this.stateUpdateCallbacks.push(callback);
  }

  private update(currentTime: number) {
    if (!this.isRunning) return;

    const deltaTime = Math.min((currentTime - this.lastTime) / 1000, 1/30); // Cap at 30fps minimum
    this.lastTime = currentTime;

    if (!this.isPaused) {
      this.updateGame(deltaTime);
    }

    this.render();
    this.gameLoop = requestAnimationFrame(this.update.bind(this));
  }

  private updateGame(deltaTime: number) {
    // Update input
    this.inputManager.update();

    // Update player
    this.player.update(deltaTime, this.inputManager);

    // Update enemies
    this.enemies.forEach(enemy => {
      enemy.update(deltaTime, this.player.getPosition());
    });

    // Update physics
    this.physics.update(deltaTime, this.player, this.enemies, this.level);

    // Update combat
    this.combat.update(deltaTime, this.player, this.enemies, this.particleSystem, this.soundManager);

    // Update particles
    this.particleSystem.update(deltaTime);

    // Update camera
    this.camera.update(deltaTime, this.player.getPosition());

    // Update animations
    this.animationSystem.update(deltaTime);

    // Check game over conditions
    if (this.player.getHealth() <= 0) {
      this.triggerGameOver();
    }

    // Notify state updates
    this.notifyStateUpdate();
  }

  private render() {
    if (!this.canvas || !this.ctx) return;

    const ctx = this.ctx;
    const camera = this.camera;

    // Clear canvas
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Save context for camera transform
    ctx.save();

    // Apply camera transform with shake
    ctx.translate(
      -camera.x + camera.shakeX + this.canvas.width / 2,
      -camera.y + camera.shakeY + this.canvas.height / 2
    );

    // Render level
    this.level.render(ctx, camera);

    // Render enemies
    this.enemies.forEach(enemy => {
      enemy.render(ctx);
    });

    // Render player
    this.player.render(ctx);

    // Render particles
    this.particleSystem.render(ctx);

    // Render combat effects
    this.combat.render(ctx);

    // Restore context
    ctx.restore();

    // Render UI elements (fixed to screen)
    this.renderUI(ctx);
  }

  private renderUI(ctx: CanvasRenderingContext2D) {
    // Debug info
    if (this.inputManager.isKeyPressed('KeyI')) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(10, 10, 200, 120);
      
      ctx.fillStyle = 'white';
      ctx.font = '12px monospace';
      ctx.fillText(`Player: ${Math.round(this.player.getPosition().x)}, ${Math.round(this.player.getPosition().y)}`, 15, 30);
      ctx.fillText(`Velocity: ${Math.round(this.player.getVelocity().x)}, ${Math.round(this.player.getVelocity().y)}`, 15, 45);
      ctx.fillText(`Health: ${this.player.getHealth()}/${this.player.getMaxHealth()}`, 15, 60);
      ctx.fillText(`Grounded: ${this.player.isGrounded()}`, 15, 75);
      ctx.fillText(`Enemies: ${this.enemies.length}`, 15, 90);
      ctx.fillText(`Particles: ${this.particleSystem.getCount()}`, 15, 105);
    }
  }

  private triggerGameOver() {
    this.soundManager.playSound('death');
    this.camera.shake(20, 1000);
    
    // Trigger explosion particles
    this.particleSystem.createExplosion(
      this.player.getPosition().x,
      this.player.getPosition().y,
      20,
      '#ff4444'
    );
  }

  private notifyStateUpdate() {
    const gameState: GameState = {
      player: {
        health: this.player.getHealth(),
        maxHealth: this.player.getMaxHealth(),
        comboCount: this.player.getComboCount(),
        position: this.player.getPosition(),
        velocity: this.player.getVelocity(),
        isGrounded: this.player.isGrounded(),
        isDashing: this.player.isDashing(),
        isAttacking: this.player.isAttacking(),
        facingDirection: this.player.getFacingDirection(),
      },
      enemies: this.enemies.map(enemy => ({
        id: enemy.getId(),
        health: enemy.getHealth(),
        maxHealth: enemy.getMaxHealth(),
        position: enemy.getPosition(),
        velocity: enemy.getVelocity(),
        type: enemy.getType(),
        state: enemy.getState(),
      })),
      camera: {
        x: this.camera.x,
        y: this.camera.y,
        shakeX: this.camera.shakeX,
        shakeY: this.camera.shakeY,
      },
      isPaused: this.isPaused,
      isGameOver: this.player.getHealth() <= 0,
    };

    this.stateUpdateCallbacks.forEach(callback => callback(gameState));
  }

  // Public methods for external control
  setPaused(paused: boolean) {
    this.isPaused = paused;
  }

  restartGame() {
    // Reset player
    this.player = new Player({ x: 400, y: 300 });
    
    // Reset enemies
    this.initializeEnemies();
    
    // Reset camera
    this.camera = new Camera();
    
    // Clear particles
    this.particleSystem.clear();
    
    // Reset combat
    this.combat.reset();
  }
}
