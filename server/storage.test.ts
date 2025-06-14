import { describe, it, expect, beforeEach } from 'vitest'
import { MemStorage } from './storage'

describe('MemStorage', () => {
  let storage: MemStorage

  beforeEach(() => {
    storage = new MemStorage()
  })

  it('increments ID when creating users', async () => {
    const user1 = await storage.createUser({ username: 'alice', password: 's' })
    expect(user1.id).toBe(1)
    const user2 = await storage.createUser({ username: 'bob', password: 's' })
    expect(user2.id).toBe(2)
  })

  it('retrieves users by ID and username', async () => {
    const created = await storage.createUser({ username: 'carol', password: 's' })
    const byId = await storage.getUser(created.id)
    expect(byId).toEqual(created)
    const byUsername = await storage.getUserByUsername('carol')
    expect(byUsername).toEqual(created)
  })
})
