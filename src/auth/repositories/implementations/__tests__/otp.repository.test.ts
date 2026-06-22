import { EOtpChannel, EOtpPurpose } from '@pkg/types'
import { OtpChallengesRepository } from '../otp.repository'

describe('OtpChallengesRepository', () => {
  let repository: OtpChallengesRepository

  beforeEach(() => {
    repository = new OtpChallengesRepository()
  })

  it('should persist the purpose of a sign-up challenge', async () => {
    const challenge = await repository.create({
      destination: '62999824266',
      purpose: EOtpPurpose.SIGN_UP,
      channel: EOtpChannel.SMS,
      codeHash: 'otp-hash',
      expiresAt: new Date(Date.now() + 60_000),
    })

    expect(challenge).toMatchObject({
      accountId: undefined,
      purpose: EOtpPurpose.SIGN_UP,
      attempts: 0,
    })
    await expect(repository.findActiveById(challenge.id)).resolves.toBe(
      challenge,
    )
  })

  it('should consume every active challenge for an account', async () => {
    const challenge = await repository.create({
      accountId: 'account-id',
      destination: '62999824266',
      purpose: EOtpPurpose.SIGN_IN,
      channel: EOtpChannel.WHATSAPP,
      codeHash: 'otp-hash',
      expiresAt: new Date(Date.now() + 60_000),
    })

    await repository.consumeActiveByAccountId('account-id')

    expect(challenge.consumedAt).toBeInstanceOf(Date)
    await expect(
      repository.findActiveById(challenge.id),
    ).resolves.toBeUndefined()
  })

  it('should increment attempts only for an active challenge', async () => {
    const challenge = await repository.create({
      accountId: 'account-id',
      destination: '62999824266',
      purpose: EOtpPurpose.SIGN_IN,
      channel: EOtpChannel.SMS,
      codeHash: 'otp-hash',
      expiresAt: new Date(Date.now() + 60_000),
    })

    await repository.incrementAttempts(challenge.id)
    await repository.consume(challenge.id)
    await repository.incrementAttempts(challenge.id)

    expect(challenge.attempts).toBe(1)
  })

  it('should not return an expired challenge as active', async () => {
    const challenge = await repository.create({
      accountId: 'account-id',
      destination: '62999824266',
      purpose: EOtpPurpose.SIGN_IN,
      channel: EOtpChannel.SMS,
      codeHash: 'otp-hash',
      expiresAt: new Date(Date.now() - 1),
    })

    await expect(
      repository.findActiveById(challenge.id),
    ).resolves.toBeUndefined()
  })
})
