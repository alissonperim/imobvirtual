import { BadRequestException, ConflictException } from '@nestjs/common'
import type { IAccountsRepository } from '@app/accounts/repositories/domain'
import {
  EAccountRole,
  EAccountStatus,
  EOtpChannel,
  EOtpPurpose,
  type Account,
  type Otp,
} from '@pkg/types'
import type { IOtpChallengesRepository } from '../../repositories/otp.domain'
import type { IOtpService } from '../../services/otp.service'
import { RequestOtpUseCase } from '../request-otp.use-case'

describe('RequestOtpUseCase', () => {
  let accountsRepository: jest.Mocked<IAccountsRepository>
  let otpRepository: jest.Mocked<IOtpChallengesRepository>
  let otpService: jest.Mocked<IOtpService>
  let sut: RequestOtpUseCase

  const account: Account = {
    id: 'account-id',
    phoneNumber: '62999824266',
    role: EAccountRole.OWNER,
    status: EAccountStatus.ACTIVE,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  }
  const expiresAt = new Date('2026-01-01T00:15:00.000Z')

  beforeEach(() => {
    accountsRepository = {
      create: jest.fn(),
      getByDestination: jest.fn(),
      getById: jest.fn(),
    }
    otpRepository = {
      create: jest.fn(),
      consumeActiveByAccountId: jest.fn(),
      findActiveById: jest.fn(),
      incrementAttempts: jest.fn(),
      consume: jest.fn(),
    }
    otpService = {
      generateOtp: jest.fn(),
      normalizeDestination: jest.fn(),
      validateOtp: jest.fn(),
    }
    otpService.normalizeDestination.mockReturnValue(account.phoneNumber)
    otpService.generateOtp.mockReturnValue({
      code: '123456',
      hash: 'otp-hash',
      expiresAt,
      expiresInSeconds: 360,
    })
    sut = new RequestOtpUseCase(accountsRepository, otpRepository, otpService)
  })

  it('should create a sign-in challenge linked to an existing account', async () => {
    const challenge = makeChallenge({
      accountId: account.id,
      purpose: EOtpPurpose.SIGN_IN,
    })
    accountsRepository.getByDestination.mockResolvedValue(account)
    otpRepository.create.mockResolvedValue(challenge)

    const result = await sut.execute({
      destination: '+5562999824266',
      channel: EOtpChannel.SMS,
      purpose: EOtpPurpose.SIGN_IN,
    })

    expect(otpService.normalizeDestination).toHaveBeenCalledWith(
      '+5562999824266',
    )
    expect(accountsRepository.getByDestination).toHaveBeenCalledWith({
      phoneNumber: account.phoneNumber,
    })
    expect(otpRepository.create).toHaveBeenCalledWith({
      accountId: account.id,
      destination: account.phoneNumber,
      channel: EOtpChannel.SMS,
      codeHash: 'otp-hash',
      expiresAt,
      purpose: EOtpPurpose.SIGN_IN,
    })
    expect(result).toEqual({
      otpChallengeId: challenge.id,
      expiresIn: 360,
      purpose: EOtpPurpose.SIGN_IN,
    })
  })

  it('should create a sign-up challenge without an account', async () => {
    const challenge = makeChallenge({ purpose: EOtpPurpose.SIGN_UP })
    accountsRepository.getByDestination.mockResolvedValue(undefined)
    otpRepository.create.mockResolvedValue(challenge)

    const result = await sut.execute({
      destination: '+5562999824266',
      channel: EOtpChannel.WHATSAPP,
      purpose: EOtpPurpose.SIGN_UP,
    })

    expect(otpRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        accountId: undefined,
        destination: account.phoneNumber,
        purpose: EOtpPurpose.SIGN_UP,
      }),
    )
    expect(result.purpose).toBe(EOtpPurpose.SIGN_UP)
  })

  it('should reject sign-in when the account does not exist', async () => {
    accountsRepository.getByDestination.mockResolvedValue(undefined)

    await expect(
      sut.execute({
        destination: '+5562999824266',
        channel: EOtpChannel.SMS,
        purpose: EOtpPurpose.SIGN_IN,
      }),
    ).rejects.toThrow(new BadRequestException('Account not found'))

    expect(otpRepository.create).not.toHaveBeenCalled()
  })

  it('should reject sign-up when the account already exists', async () => {
    accountsRepository.getByDestination.mockResolvedValue(account)

    await expect(
      sut.execute({
        destination: '+5562999824266',
        channel: EOtpChannel.SMS,
        purpose: EOtpPurpose.SIGN_UP,
      }),
    ).rejects.toThrow(new ConflictException('Account already exists'))

    expect(otpRepository.create).not.toHaveBeenCalled()
  })

  function makeChallenge(params: {
    purpose: EOtpPurpose
    accountId?: string
  }): Otp {
    return {
      id: 'otp-challenge-id',
      accountId: params.accountId,
      destination: account.phoneNumber,
      purpose: params.purpose,
      channel: EOtpChannel.SMS,
      codeHash: 'otp-hash',
      expiresAt,
      attempts: 0,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    }
  }
})
