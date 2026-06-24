import { UnauthorizedException } from '@nestjs/common'
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
import type { IRefreshTokenSessionsRepository } from '../../repositories/session.domain'
import type { IOtpService } from '../../services/otp.service'
import type { ITokenService } from '../../services/token.service'
import { VerifySignUpOtpUseCase } from '../verify-sign-up-otp.use-case'

describe('VerifySignUpOtpUseCase', () => {
  let otpRepository: jest.Mocked<IOtpChallengesRepository>
  let otpService: jest.Mocked<IOtpService>
  let tokenService: jest.Mocked<ITokenService>
  let accountsRepository: jest.Mocked<IAccountsRepository>
  let sessionsRepository: jest.Mocked<IRefreshTokenSessionsRepository>
  let sut: VerifySignUpOtpUseCase

  const challenge: Otp = {
    id: 'otp-id',
    destination: '62999824266',
    purpose: EOtpPurpose.SIGN_UP,
    channel: EOtpChannel.SMS,
    codeHash: 'otp-hash',
    expiresAt: new Date('2026-01-01T00:15:00.000Z'),
    attempts: 0,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  }
  const account: Account = {
    id: 'account-id',
    phoneNumber: challenge.destination,
    role: EAccountRole.RENTER,
    status: EAccountStatus.ACTIVE,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  }

  beforeEach(() => {
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
    tokenService = {
      generate: jest.fn(),
      generateRefreshToken: jest.fn(),
      hashRefreshToken: jest.fn(),
    }
    accountsRepository = {
      create: jest.fn(),
      getByDestination: jest.fn(),
      getById: jest.fn(),
    }
    sessionsRepository = {
      create: jest.fn(),
      findActiveByTokenHash: jest.fn(),
      rotate: jest.fn(),
      revoke: jest.fn(),
    }
    sut = new VerifySignUpOtpUseCase(
      otpRepository,
      otpService,
      tokenService,
      accountsRepository,
      sessionsRepository,
    )
  })

  it('should create the account, session and token pair for a valid OTP', async () => {
    otpRepository.findActiveById.mockResolvedValue(challenge)
    otpService.validateOtp.mockReturnValue(true)
    accountsRepository.create.mockResolvedValue(account)
    tokenService.generateRefreshToken.mockReturnValue({
      refreshToken: 'refresh-token',
      tokenHash: 'refresh-hash',
      expiresAt: new Date('2026-02-01T00:00:00.000Z'),
    })
    tokenService.generate.mockResolvedValue({ accessToken: 'access-token' })

    const result = await sut.execute({
      otpId: challenge.id,
      otp: '123456',
      role: EAccountRole.RENTER,
      name: 'Maria',
    })

    expect(accountsRepository.create).toHaveBeenCalledWith({
      phoneNumber: challenge.destination,
      role: EAccountRole.RENTER,
      status: EAccountStatus.ACTIVE,
      name: 'Maria',
    })
    expect(otpRepository.consume).toHaveBeenCalledWith(challenge.id)
    expect(sessionsRepository.create).toHaveBeenCalledWith({
      id: expect.any(String),
      accountId: account.id,
      tokenHash: 'refresh-hash',
      expiresAt: new Date('2026-02-01T00:00:00.000Z'),
    })
    expect(tokenService.generate).toHaveBeenCalledWith({
      clientId: account.id,
      role: account.role,
      sessionId: expect.any(String),
    })
    expect(result).toEqual({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    })
  })

  it('should increment attempts and reject an invalid OTP', async () => {
    otpRepository.findActiveById.mockResolvedValue(challenge)
    otpService.validateOtp.mockReturnValue(false)

    await expect(
      sut.execute({
        otpId: challenge.id,
        otp: '654321',
        role: EAccountRole.RENTER,
        name: 'Maria',
      }),
    ).rejects.toThrow(new UnauthorizedException('Invalid OTP'))

    expect(otpRepository.incrementAttempts).toHaveBeenCalledWith(challenge.id)
    expect(accountsRepository.create).not.toHaveBeenCalled()
  })

  it('should reject a challenge created for sign-in', async () => {
    otpRepository.findActiveById.mockResolvedValue({
      ...challenge,
      accountId: account.id,
      purpose: EOtpPurpose.SIGN_IN,
    })

    await expect(
      sut.execute({
        otpId: challenge.id,
        otp: '123456',
        role: EAccountRole.RENTER,
        name: 'Maria',
      }),
    ).rejects.toThrow(new UnauthorizedException('Invalid OTP'))

    expect(otpService.validateOtp).not.toHaveBeenCalled()
    expect(accountsRepository.create).not.toHaveBeenCalled()
  })

  it('should consume and reject a challenge at the attempt limit', async () => {
    otpRepository.findActiveById.mockResolvedValue({
      ...challenge,
      attempts: 3,
    })

    await expect(
      sut.execute({
        otpId: challenge.id,
        otp: '123456',
        role: EAccountRole.RENTER,
        name: 'Maria',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException)

    expect(otpRepository.consume).toHaveBeenCalledWith(challenge.id)
    expect(accountsRepository.create).not.toHaveBeenCalled()
  })
})
