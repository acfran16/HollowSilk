import { Animation, AnimationFrame } from "./types";

export class AnimationSystem {
  private animations: Map<string, Animation> = new Map();
  private currentAnimations: Map<string, { animation: Animation; currentFrame: number; time: number }> = new Map();

  constructor() {
    this.initializeAnimations();
  }

  private initializeAnimations() {
    // Player animations
    this.animations.set('player_idle', {
      name: 'player_idle',
      frames: [
        { x: 0, y: 0, width: 32, height: 48, duration: 0.5 },
        { x: 32, y: 0, width: 32, height: 48, duration: 0.5 }
      ],
      loop: true
    });

    this.animations.set('player_run', {
      name: 'player_run',
      frames: [
        { x: 0, y: 48, width: 32, height: 48, duration: 0.15 },
        { x: 32, y: 48, width: 32, height: 48, duration: 0.15 },
        { x: 64, y: 48, width: 32, height: 48, duration: 0.15 },
        { x: 96, y: 48, width: 32, height: 48, duration: 0.15 }
      ],
      loop: true
    });

    this.animations.set('player_jump', {
      name: 'player_jump',
      frames: [
        { x: 0, y: 96, width: 32, height: 48, duration: 0.3 },
        { x: 32, y: 96, width: 32, height: 48, duration: 0.3 }
      ],
      loop: false
    });

    this.animations.set('player_attack', {
      name: 'player_attack',
      frames: [
        { x: 0, y: 144, width: 32, height: 48, duration: 0.1 },
        { x: 32, y: 144, width: 32, height: 48, duration: 0.15 },
        { x: 64, y: 144, width: 32, height: 48, duration: 0.1 }
      ],
      loop: false
    });

    // Enemy animations
    this.animations.set('crawler_idle', {
      name: 'crawler_idle',
      frames: [
        { x: 0, y: 0, width: 32, height: 24, duration: 0.8 },
        { x: 32, y: 0, width: 32, height: 24, duration: 0.8 }
      ],
      loop: true
    });

    this.animations.set('flyer_idle', {
      name: 'flyer_idle',
      frames: [
        { x: 0, y: 24, width: 28, height: 28, duration: 0.2 },
        { x: 28, y: 24, width: 28, height: 28, duration: 0.2 },
        { x: 56, y: 24, width: 28, height: 28, duration: 0.2 }
      ],
      loop: true
    });
  }

  update(deltaTime: number) {
    this.currentAnimations.forEach((animState, entityId) => {
      animState.time += deltaTime;
      
      const currentFrame = animState.animation.frames[animState.currentFrame];
      
      if (animState.time >= currentFrame.duration) {
        animState.time = 0;
        animState.currentFrame++;
        
        if (animState.currentFrame >= animState.animation.frames.length) {
          if (animState.animation.loop) {
            animState.currentFrame = 0;
          } else {
            animState.currentFrame = animState.animation.frames.length - 1;
          }
        }
      }
    });
  }

  playAnimation(entityId: string, animationName: string) {
    const animation = this.animations.get(animationName);
    if (!animation) return;

    this.currentAnimations.set(entityId, {
      animation,
      currentFrame: 0,
      time: 0
    });
  }

  getCurrentFrame(entityId: string): AnimationFrame | null {
    const animState = this.currentAnimations.get(entityId);
    if (!animState) return null;

    return animState.animation.frames[animState.currentFrame];
  }

  isAnimationComplete(entityId: string): boolean {
    const animState = this.currentAnimations.get(entityId);
    if (!animState) return true;

    return !animState.animation.loop && 
           animState.currentFrame === animState.animation.frames.length - 1;
  }

  stopAnimation(entityId: string) {
    this.currentAnimations.delete(entityId);
  }
}
