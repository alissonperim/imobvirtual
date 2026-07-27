import { EOtpChannel, EOtpPurpose } from '@pkg/types'
import type { Repository } from 'typeorm'
import { OtpRepository } from '../otp.repository'
import type {
  OtpChallengeEntity,
  PendingRegistrationEntity,
} from '@app/database/entities'

const makeRow = (
  overrides: Partial<OtpChallengeEntity> = {},
): OtpChallengeEntity =>
  ({
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
  }) as OtpChallengeEntity

describe('OtpRepository', () => {
  let repository: jest.Mocked<
    Pick<
      Repository<OtpChallengeEntity>,
      'create' | 'save' | 'findOne' | 'update' | 'increment'
    >
  >
  let pendingRegistrationRepository: Repository<PendingRegistrationEntity>
  let sut: OtpRepository

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      increment: jest.fn(),
    }
    pendingRegistrationRepository =
      {} as unknown as Repository<PendingRegistrationEntity>
    sut = new OtpRepository(
      repository as unknown as Repository<OtpChallengeEntity>,
      pendingRegistrationRepository,
    )
  })

  it('should map the created row to an Otp domain object', async () => {
    const row = makeRow()
    repository.create.mockReturnValue(row)
    repository.save.mockResolvedValue(row)

    const result = await sut.create({
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

  it('should query findOne with expiry and consumedAt filters', async () => {
    repository.findOne.mockResolvedValue(null)

    const result = await sut.findActiveById('otp-id')

    expect(repository.findOne).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ id: 'otp-id' }),
      }),
    )
    expect(result).toBeUndefined()
  })

  it('should return the mapped otp when findOne returns a row', async () => {
    repository.findOne.mockResolvedValue(makeRow())

    const result = await sut.findActiveById('otp-id')

    expect(result).toMatchObject({ id: 'otp-id', attempts: 0 })
  })

  it('should call increment on incrementAttempts', async () => {
    await sut.incrementAttempts('otp-id')

    expect(repository.increment).toHaveBeenCalledWith(
      { id: 'otp-id' },
      'attempts',
      1,
    )
  })

  it('should call update with consumedAt on consume', async () => {
    await sut.consume('otp-id')

    expect(repository.update).toHaveBeenCalledWith(
      { id: 'otp-id' },
      expect.objectContaining({ consumedAt: expect.any(Date) }),
    )
  })

  it('should call update with accountId filter on consumeActiveByAccountId', async () => {
    await sut.consumeActiveByAccountId('account-id')

    expect(repository.update).toHaveBeenCalledWith(
      expect.objectContaining({ account: { id: 'account-id' } }),
      expect.objectContaining({ consumedAt: expect.any(Date) }),
    )
  })
})
