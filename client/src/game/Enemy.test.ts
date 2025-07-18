import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { Physics } from './Physics'
import { Rectangle, Vector2 } from './types'

// Helper function to create an enemy mock
function createEnemy(position: Vector2, velocity: Vector2, size: Vector2) {
  const enemy = {
    position: { ...position },
    velocity: { ...velocity },
    size: { ...size },
    type: 'crawler',
    damaged: false,
    getPosition() { return this.position },
    getVelocity() { return this.velocity },
    getSize() { return this.size },
    getType() { return this.type },
    getBounds() {
      return {
        x: this.position.x - this.size.x / 2,
        y: this.position.y - this.size.y / 2,
        width: this.size.x,
        height: this.size.y
      }
    },
    setGrounded: () => {},
    takeDamage: () => { enemy.damaged = true }
  }
  return enemy
}

function createLevel(platforms: Rectangle[], bounds: { left: number; right: number; top: number; bottom: number }) {
  return {
    getPlatforms() { return platforms },
    getWorldBounds() { return bounds }
  }
}

describe('Physics.updateEnemyPhysics', () => {
  it('stops downward velocity when colliding with a platform', () => {
    const physics = new Physics()
    const enemy = createEnemy({ x: 50, y: 55 }, { x: 0, y: 50 }, { x: 20, y: 20 })
    const level = createLevel([{ x: 0, y: 60, width: 100, height: 10 }], { left: 0, right: 200, top: 0, bottom: 100 })

    ;(physics as any).updateEnemyPhysics(0.016, enemy, level)

    assert.equal(enemy.velocity.y, 0)
    assert.equal(enemy.position.y, 60 - enemy.size.y / 2)
  })

  it('reverses horizontal velocity at world boundaries', () => {
    const physics = new Physics()
    const enemy = createEnemy({ x: 205, y: 50 }, { x: 10, y: 0 }, { x: 20, y: 20 })
    const level = createLevel([], { left: 0, right: 200, top: 0, bottom: 100 })

    ;(physics as any).updateEnemyPhysics(0.016, enemy, level)

    assert.equal(enemy.velocity.x, -10)
  })

  it('clamps enemy position when falling out of bounds', () => {
    const physics = new Physics()
    const enemy = createEnemy({ x: 50, y: 350 }, { x: 0, y: 0 }, { x: 20, y: 20 })
    const level = createLevel([], { left: 0, right: 200, top: 0, bottom: 100 })

    ;(physics as any).updateEnemyPhysics(0.016, enemy, level)

    assert.equal(enemy.position.y, 100 - enemy.size.y / 2)
    assert.equal(enemy.velocity.y, 0)
  })
})
