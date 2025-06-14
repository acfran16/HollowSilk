import { describe, it, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { MemStorage } from './storage.js'

describe('MemStorage', () => {
  let storage

  beforeEach(() => {
    storage = new MemStorage()
  })

  it('increments ID when creating users', async () => {
    const user1 = await storage.createUser({ username: 'alice', password: 's' })
    assert.equal(user1.id, 1)
    const user2 = await storage.createUser({ username: 'bob', password: 's' })
    assert.equal(user2.id, 2)
  })

  it('retrieves users by ID and username', async () => {
    const created = await storage.createUser({ username: 'carol', password: 's' })
    const byId = await storage.getUser(created.id)
    assert.deepEqual(byId, created)
    const byUsername = await storage.getUserByUsername('carol')
    assert.deepEqual(byUsername, created)
  })
})
