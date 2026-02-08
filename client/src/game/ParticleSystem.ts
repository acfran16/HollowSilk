import { Particle } from "./types";

export class ParticleSystem {
  private particles: Particle[] = [];
  private nextId: number = 0;

  update(deltaTime: number) {
    // Update all particles
    this.particles.forEach(particle => {
      particle.x += particle.vx * deltaTime;
      particle.y += particle.vy * deltaTime;
      particle.vy += particle.gravity * deltaTime;
      particle.life -= deltaTime;
    });

    // Remove dead particles
    this.particles = this.particles.filter(particle => particle.life > 0);
  }

  render(ctx: CanvasRenderingContext2D) {
    this.particles.forEach(particle => {
      const alpha = particle.life / particle.maxLife;
      const size = particle.size * alpha;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = particle.color;

      ctx.beginPath();
      ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    });
  }

  createExplosion(x: number, y: number, count: number, color: string) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const speed = 100 + Math.random() * 200;

      this.particles.push({
        id: (this.nextId++).toString(),
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.5 + Math.random() * 0.5,
        maxLife: 1.0,
        color: color,
        size: 2 + Math.random() * 4,
        gravity: 200
      });
    }
  }

  createHitEffect(x: number, y: number, color: string) {
    const count = 8 + Math.random() * 8;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 50 + Math.random() * 100;

      this.particles.push({
        id: (this.nextId++).toString(),
        x: x + (Math.random() - 0.5) * 20,
        y: y + (Math.random() - 0.5) * 20,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 50,
        life: 0.3 + Math.random() * 0.3,
        maxLife: 0.6,
        color: color,
        size: 1 + Math.random() * 3,
        gravity: 300
      });
    }
  }

  createTrail(x: number, y: number, color: string) {
    this.particles.push({
      id: (this.nextId++).toString(),
      x: x + (Math.random() - 0.5) * 10,
      y: y + (Math.random() - 0.5) * 10,
      vx: (Math.random() - 0.5) * 20,
      vy: (Math.random() - 0.5) * 20,
      life: 0.2 + Math.random() * 0.2,
      maxLife: 0.4,
      color: color,
      size: 1 + Math.random() * 2,
      gravity: 0
    });
  }

  createDashEffect(x: number, y: number) {
    const count = 5;

    for (let i = 0; i < count; i++) {
      this.particles.push({
        id: (this.nextId++).toString(),
        x: x + (Math.random() - 0.5) * 30,
        y: y + (Math.random() - 0.5) * 30,
        vx: (Math.random() - 0.5) * 50,
        vy: (Math.random() - 0.5) * 50,
        life: 0.3,
        maxLife: 0.3,
        color: '#4488ff',
        size: 2 + Math.random() * 2,
        gravity: 0
      });
    }
  }

  createJumpEffect(x: number, y: number) {
    const count = 10;
    for (let i = 0; i < count; i++) {
      this.particles.push({
        id: (this.nextId++).toString(),
        x: x + (Math.random() - 0.5) * 20,
        y: y,
        vx: (Math.random() - 0.5) * 100,
        vy: 50 + Math.random() * 50, // Downwards push
        life: 0.3 + Math.random() * 0.2,
        maxLife: 0.5,
        color: '#ffffff',
        size: 2 + Math.random() * 3,
        gravity: 100
      });
    }
  }

  createLandEffect(x: number, y: number) {
    const count = 15;
    for (let i = 0; i < count; i++) {
      this.particles.push({
        id: (this.nextId++).toString(),
        x: x + (Math.random() - 0.5) * 30,
        y: y,
        vx: (Math.random() - 0.5) * 150,
        vy: -50 - Math.random() * 50, // Upwards and outwards
        life: 0.4 + Math.random() * 0.3,
        maxLife: 0.7,
        color: '#dddddd',
        size: 2 + Math.random() * 4,
        gravity: 200
      });
    }
  }

  clear() {
    this.particles = [];
  }

  getCount(): number {
    return this.particles.length;
  }
}
