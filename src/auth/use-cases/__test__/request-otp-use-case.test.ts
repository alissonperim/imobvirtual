/* eslint-disable @typescript-eslint/unbound-method */
import { BadRequestException } from '@nestjs/common'
import type { IAccountsRepository } from '@app/accounts/repositories/domain'
import {
  EAccountRole,
  EAccountStatus,
  EOtpChannel,
  type Account,
  type Otp,
} from '@pkg/types'
import type { IOtpChallengesRepository } from '../../repositories/domain'
import type { IOtpService } from '../../services/otp-service'
import { RequestOtpUseCase } from '../request-otp-use-case'

describe('RequestOtpUseCase', () => {
  let accountsRepository: jest.Mocked<IAccountsRepository>
  let otpRepository: jest.Mocked<IOtpChallengesRepository>
  let otpService: jest.Mocked<IOtpService>
  let sut: RequestOtpUseCase

  const account: Account = {
    id: 'account-id',
    email: 'user@example.com',
    phoneNumber: '62999824266',
    role: EAccountRole.OWNER,
    status: EAccountStatus.ACTIVE,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  }

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
    sut = new RequestOtpUseCase(accountsRepository, otpRepository, otpService)
  })

  it.each([
    {
      channel: EOtpChannel.EMAIL,
      destination: 'user@example.com',
      normalizedDestination: 'user@example.com',
      accountLookup: { email: 'user@example.com' },
    },
    {
      channel: EOtpChannel.SMS,
      destination: '+5562999824266',
      normalizedDestination: '62999824266',
      accountLookup: { phoneNumber: '62999824266' },
    },
  ])(
    'should create an OTP challenge for the $channel channel',
    async ({ channel, destination, normalizedDestination, accountLookup }) => {
      const expiresIn = Date.parse('2026-01-01T00:15:00.000Z')
      const otpChallenge: Otp = {
        id: 'otp-challenge-id',
        accountId: account.id,
        destination,
        channel,
        codeHash: 'otp-hash',
        expiresAt: new Date(expiresIn),
        attempts: 0,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      }

      otpService.normalizeDestination.mockReturnValue(normalizedDestination)
      accountsRepository.getByDestination.mockResolvedValue(account)
      otpService.generateOtp.mockReturnValue({
        code: '123456',
        hash: 'otp-hash',
        expiresIn,
      })
      otpRepository.create.mockResolvedValue(otpChallenge)

      const result = await sut.execute({ destination, channel })

      expect(otpService.normalizeDestination).toHaveBeenCalledWith(
        destination,
        channel,
      )
      expect(accountsRepository.getByDestination).toHaveBeenCalledWith(
        accountLookup,
      )
      expect(otpRepository.create).toHaveBeenCalledWith({
        accountId: account.id,
        destination,
        channel,
        codeHash: 'otp-hash',
        expiresAt: new Date(expiresIn),
      })
      expect(result).toEqual({
        otpChallengeId: otpChallenge.id,
        expiresIn,
      })
    },
  )

  it('should reject when no account matches the destination', async () => {
    otpService.normalizeDestination.mockReturnValue('missing@example.com')
    accountsRepository.getByDestination.mockResolvedValue(undefined)

    await expect(
      sut.execute({
        destination: 'missing@example.com',
        channel: EOtpChannel.EMAIL,
      }),
    ).rejects.toBeInstanceOf(BadRequestException)

    expect(otpService.generateOtp).not.toHaveBeenCalled()
    expect(otpRepository.create).not.toHaveBeenCalled()
  })
})
