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
  private camera!: Camera;
  private particleSystem: ParticleSystem;
  private level: Level | undefined;
  private inputManager: InputManager | undefined;
  private animationSystem: AnimationSystem;
  private soundManager!: SoundManager;
  private combat: Combat;
  private physics: Physics;
  
  private lastTime = 0;
  private gameLoop: number = 0;
  private isRunning = false;
  private isPaused = false;

  // Game state callbacks
  private stateUpdateCallbacks: ((state: GameState) => void)[] = [];

  constructor() {
    this.particleSystem = new ParticleSystem();
    this.animationSystem = new AnimationSystem();
    this.combat = new Combat();
    this.physics = new Physics();
    
    // Initialize player at the beginning of the level on the main ground platform
    // We initialize the level first to get the world bounds
    this.level = new Level(1024, 768); // Use a temporary size to get bounds, will be re-initialized
 if (this.level) {
 this.player = new Player({ x: this.level.getWorldBounds().left, y: this.level.getWorldBounds().bottom });
    } else {
 this.player = new Player({ x: 0, y: 0 }); // Fallback position
    }
    
    // Initialize some enemies
    this.initializeEnemies();
  }

  initialize(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    this.canvas = canvas;
    this.ctx = ctx;

    this.inputManager = new InputManager();
    this.inputManager.initialize();
    this.soundManager = new SoundManager();
    this.soundManager.initialize();
    // Initialize level with canvas dimensions
    // Level was already initialized in constructor to get player start position, re-initialize with actual canvas size
    this.level = new Level(canvas.width, canvas.height);
    // Initialize camera with the vertical boundary
    this.camera = new Camera(this.level.getWorldBounds().bottom - 250);
    
    this.soundManager.initialize();
    
    this.start();
  }

  private initializeEnemies() {
    // Create enemies spread across the side-scrolling level
    this.enemies = [
      new Enemy({ x: 700, y: 300 }, 'crawler'),
      new Enemy({ x: 900, y: 200 }, 'flyer'),
      new Enemy({ x: 1200, y: 350 }, 'guardian'),
      new Enemy({ x: 1400, y: 300 }, 'crawler'),
      new Enemy({ x: 1600, y: 200 }, 'flyer'),
      new Enemy({ x: 1900, y: 350 }, 'crawler'),
      new Enemy({ x: 2100, y: 250 }, 'guardian'),
      new Enemy({ x: 2300, y: 300 }, 'flyer'),
      new Enemy({ x: 2500, y: 350 }, 'crawler'),
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
    this.stop();    if (this.inputManager)
    this.inputManager.destroy();
    this.soundManager.destroy();
  }

  onStateUpdate(callback: (state: GameState) => void) {
    this.stateUpdateCallbacks.push(callback);
  }

  handleVirtualInput(action: string, pressed: boolean) {
    if (this.inputManager) { 
      this.inputManager.setVirtualInput(action, pressed);
    }
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
    // Update player
    this.player.update(deltaTime, this.inputManager!); // Use definite assignment assertion here
    if (!this.level) return; // Ensure level is initialized

    // Update enemies
    this.enemies.forEach(enemy => {
      // Add check for level before accessing its properties
      if (!this.level) {
        return; 
      }
      enemy.update(deltaTime, this.player.getPosition(), this.level.getPlatforms());
    });
    
    // Update physics
 this.physics.update(deltaTime, this.player, this.enemies, this.level!);

    // Update combat
    if (this.soundManager) {
 this.combat.update(deltaTime, this.player, this.enemies, this.particleSystem, this.soundManager!); // Use non-null assertion
    }

    // Update particles
    this.particleSystem.update(deltaTime);

    // Update camera
    this.camera.update(deltaTime, this.player.getPosition(), this.level.getWorldBounds());

    // Update animations
    this.animationSystem.update(deltaTime);

    // Check game over conditions
    if (this.player.getHealth() <= 0) {
      this.triggerGameOver();
    }

    // Notify state updates
    this.notifyStateUpdate();

    // Clear input at the end so justPressed states remain valid
    this.inputManager!.update(); // Use definite assignment assertion
  }

  private render() {
    if (!this.canvas || !this.ctx) return;
    if (!this.level) return; // Ensure level is initialized

    const ctx = this.ctx;
    const camera = this.camera;


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
    if (this.inputManager?.isKeyPressed('KeyI')) { // Use optional chaining
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
    if (!this.soundManager) return; // Add check and return early
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
    // Reset player to the beginning of the level on the main ground platform
 if (this.level) {
 this.player = new Player({ x: this.level.getWorldBounds().left, y: this.level.getWorldBounds().bottom });
    } else {
 this.player = new Player({ x: 0, y: 0 }); // Fallback position
    }

    // Reset enemies
    this.initializeEnemies();

    // Reset camera
    // Ensure camera is re-initialized after player reset
 this.camera = new Camera(this.level ? this.level.getWorldBounds().bottom - 250 : 0); // Use a fallback vertical position if level is undefined

    // Clear particles
    this.particleSystem.clear();

    // Reset combat
    this.combat.reset();
 }
}