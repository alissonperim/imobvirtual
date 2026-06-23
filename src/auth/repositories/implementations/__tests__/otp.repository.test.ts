import { EOtpChannel, EOtpPurpose } from '@pkg/types'
import { OtpChallengesRepository } from '../otp.repository'
import type { PrismaService } from '@app/prisma/prisma.service'

const makeRow = (overrides: object = {}) => ({
  id: 'otp-id',
  destination: '62999824266',
  purpose: EOtpPurpose.SIGN_UP,
  channel: EOtpChannel.SMS,
  accountId: null,
  codeHash: 'otp-hash',
  expiresAt: new Date(Date.now() + 60_000),
  attempts: 0,
  consumedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

describe('OtpChallengesRepository', () => {
  let prisma: { otpChallenge: Record<string, jest.Mock> }
  let repository: OtpChallengesRepository

  beforeEach(() => {
    prisma = {
      otpChallenge: {
        create: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
    }
    repository = new OtpChallengesRepository(prisma as unknown as PrismaService)
  })

  it('should map the created row to an Otp domain object', async () => {
    const row = makeRow()
    prisma.otpChallenge.create.mockResolvedValue(row)

    const result = await repository.create({
      destination: '62999824266',
      purpose: EOtpPurpose.SIGN_UP,
      channel: EOtpChannel.SMS,
      codeHash: 'otp-hash',
      expiresAt: row.expiresAt,
    })

    expect(result).toMatchObject({
      id: 'otp-id',
      accountId: undefined,
      purpose: EOtpPurpose.SIGN_UP,
      attempts: 0,
    })
  })

  it('should query findFirst with expiry and consumedAt filters', async () => {
    prisma.otpChallenge.findFirst.mockResolvedValue(null)

    const result = await repository.findActiveById('otp-id')

    expect(prisma.otpChallenge.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ id: 'otp-id', consumedAt: null }),
      }),
    )
    expect(result).toBeUndefined()
  })

  it('should return the mapped otp when findFirst returns a row', async () => {
    prisma.otpChallenge.findFirst.mockResolvedValue(makeRow())

    const result = await repository.findActiveById('otp-id')

    expect(result).toMatchObject({ id: 'otp-id', attempts: 0 })
  })

  it('should call update with increment on incrementAttempts', async () => {
    prisma.otpChallenge.update.mockResolvedValue(makeRow({ attempts: 1 }))

    await repository.incrementAttempts('otp-id')

    expect(prisma.otpChallenge.update).toHaveBeenCalledWith({
      where: { id: 'otp-id' },
      data: { attempts: { increment: 1 } },
    })
  })

  it('should call updateMany with accountId filter on consumeActiveByAccountId', async () => {
    prisma.otpChallenge.updateMany.mockResolvedValue({ count: 1 })

    await repository.consumeActiveByAccountId('account-id')

    expect(prisma.otpChallenge.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ accountId: 'account-id', consumedAt: null }),
        data: expect.objectContaining({ consumedAt: expect.any(Date) }),
      }),
    )
  })
})
