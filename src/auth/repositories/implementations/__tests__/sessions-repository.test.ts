import type { Repository, UpdateResult } from 'typeorm'
import { SessionsRepository } from '../sessions.repository'
import type { SessionEntity } from '@app/database/entities'

const makeRow = (overrides: Partial<SessionEntity> = {}): SessionEntity =>
  ({
    id: 'session-id',
    accountId: 'account-id',
    tokenHash: 'token-hash',
    expiresAt: new Date(Date.now() + 60_000),
    revokedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }) as SessionEntity

describe('SessionsRepository', () => {
  let repository: jest.Mocked<
    Pick<Repository<SessionEntity>, 'create' | 'save' | 'findOne' | 'update'>
  >
  let sut: SessionsRepository

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
    }
    sut = new SessionsRepository(
      repository as unknown as Repository<SessionEntity>,
    )
  })

  it('should map the saved row to a Session domain object', async () => {
    const row = makeRow()
    repository.create.mockReturnValue(row)
    repository.save.mockResolvedValue(row)

    const result = await sut.create({
      accountId: 'account-id',
      tokenHash: 'token-hash',
      expiresAt: new Date(Date.now() + 60_000),
    })

    expect(result).toMatchObject({ id: 'session-id', revokedAt: null })
  })

  it('should return undefined when findActiveByTokenHash finds nothing', async () => {
    repository.findOne.mockResolvedValue(null)

    const result = await sut.findActiveByTokenHash('old-hash')

    expect(result).toBeUndefined()
  })

  it('should return true and call update with new hash on rotate', async () => {
    repository.update.mockResolvedValue({ affected: 1 } as UpdateResult)

    const wasRotated = await sut.rotate(
      'session-id',
      'old-hash',
      'new-hash',
      new Date(Date.now() + 60_000),
    )

    expect(wasRotated).toBe(true)
    expect(repository.update).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'session-id',
        tokenHash: 'old-hash',
      }),
      expect.objectContaining({ tokenHash: 'new-hash' }),
    )
  })

  it('should return false when no session matches on rotate', async () => {
    repository.update.mockResolvedValue({ affected: 0 } as UpdateResult)

    const wasRotated = await sut.rotate(
      'session-id',
      'wrong-hash',
      'new-hash',
      new Date(),
    )

    expect(wasRotated).toBe(false)
  })

  it('should call update with revokedAt on revoke', async () => {
    repository.update.mockResolvedValue({ affected: 1 } as UpdateResult)

    await sut.revoke('session-id')

    expect(repository.update).toHaveBeenCalledWith(
      { id: 'session-id' },
      { revokedAt: expect.any(Date) },
    )
  })
})
