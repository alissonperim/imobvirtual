import { SessionsRepository } from '../sessions.repository'
import type { PrismaService } from '@app/prisma/prisma.service'

const makeRow = (overrides: object = {}) => ({
  id: 'session-id',
  accountId: 'account-id',
  tokenHash: 'token-hash',
  expiresAt: new Date(Date.now() + 60_000),
  revokedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

describe('SessionsRepository', () => {
  let prisma: { Session: Record<string, jest.Mock> }
  let repository: SessionsRepository

  beforeEach(() => {
    prisma = {
      Session: {
        create: jest.fn(),
        findFirst: jest.fn(),
        updateMany: jest.fn(),
        update: jest.fn(),
      },
    }
    repository = new SessionsRepository(prisma as unknown as PrismaService)
  })

  it('should map the created row to a Session domain object', async () => {
    prisma.Session.create.mockResolvedValue(makeRow())

    const result = await repository.create({
      accountId: 'account-id',
      tokenHash: 'token-hash',
      expiresAt: new Date(Date.now() + 60_000),
    })

    expect(result).toMatchObject({ id: 'session-id', revokedAt: undefined })
  })

  it('should return undefined when findActiveByTokenHash finds nothing', async () => {
    prisma.Session.findFirst.mockResolvedValue(null)

    const result = await repository.findActiveByTokenHash('old-hash')

    expect(result).toBeUndefined()
  })

  it('should return true and call updateMany with new hash on rotate', async () => {
    prisma.Session.updateMany.mockResolvedValue({ count: 1 })

    const wasRotated = await repository.rotate(
      'session-id',
      'old-hash',
      'new-hash',
      new Date(Date.now() + 60_000),
    )

    expect(wasRotated).toBe(true)
    expect(prisma.Session.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          id: 'session-id',
          tokenHash: 'old-hash',
          revokedAt: null,
        }),
        data: expect.objectContaining({ tokenHash: 'new-hash' }),
      }),
    )
  })

  it('should return false when no session matches on rotate', async () => {
    prisma.Session.updateMany.mockResolvedValue({ count: 0 })

    const wasRotated = await repository.rotate(
      'session-id',
      'wrong-hash',
      'new-hash',
      new Date(),
    )

    expect(wasRotated).toBe(false)
  })

  it('should call update with revokedAt on revoke', async () => {
    prisma.Session.update.mockResolvedValue(makeRow({ revokedAt: new Date() }))

    await repository.revoke('session-id')

    expect(prisma.Session.update).toHaveBeenCalledWith({
      where: { id: 'session-id' },
      data: { revokedAt: expect.any(Date) },
    })
  })
})
