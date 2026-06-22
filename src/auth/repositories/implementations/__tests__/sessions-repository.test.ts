import { RefreshTokenSessionsRepository } from '../sessions.repository'

describe('RefreshTokenSessionsRepository', () => {
  it('should invalidate the previous token hash after rotation', async () => {
    const repository = new RefreshTokenSessionsRepository()

    await repository.create({
      id: 'session-id',
      accountId: 'account-id',
      tokenHash: 'old-hash',
      expiresAt: new Date(Date.now() + 60_000),
    })

    const wasRotated = await repository.rotate(
      'session-id',
      'old-hash',
      'new-hash',
      new Date(Date.now() + 60_000),
    )

    expect(wasRotated).toBe(true)
    await expect(repository.findActiveByTokenHash('old-hash')).resolves.toBe(
      undefined,
    )
    await expect(
      repository.findActiveByTokenHash('new-hash'),
    ).resolves.toMatchObject({ id: 'session-id' })
  })
})
