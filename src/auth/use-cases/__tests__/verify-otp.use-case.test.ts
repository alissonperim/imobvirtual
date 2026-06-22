/* eslint-disable @typescript-eslint/unbound-method */
import { UnauthorizedException } from '@nestjs/common'
import type { IAccountsRepository } from '@app/accounts/repositories/domain'
import {
  EAccountRole,
  EAccountStatus,
  EOtpChannel,
  type Account,
  type Otp,
} from '@pkg/types'
import type { IOtpChallengesRepository } from '../../repositories/otp.domain'
import type { IOtpService } from '../../services/otp.service'
import type { ITokenService } from '../../services/token.service'
import { VerifyOtpUseCase } from '../verify-otp.use-case'
import type { IRefreshTokenSessionsRepository } from '../../repositories/session.domain'

describe('VerifyOtpUseCase', () => {
  let repository: jest.Mocked<IOtpChallengesRepository>
  let otpService: jest.Mocked<IOtpService>
  let tokenService: jest.Mocked<ITokenService>
  let accountsRepository: jest.Mocked<IAccountsRepository>
  let refreshTokenSessionsRepository: jest.Mocked<IRefreshTokenSessionsRepository>
  let sut: VerifyOtpUseCase

  const account: Account = {
    id: 'account-id',
    email: 'user@example.com',
    role: EAccountRole.OWNER,
    status: EAccountStatus.ACTIVE,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  }

  const otpChallenge: Otp = {
    id: 'otp-challenge-id',
    accountId: account.id,
    destination: account.email as string,
    channel: EOtpChannel.EMAIL,
    codeHash: 'otp-hash',
    expiresAt: new Date('2026-01-01T00:15:00.000Z'),
    attempts: 0,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  }

  beforeEach(() => {
    repository = {
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
    refreshTokenSessionsRepository = {
      create: jest.fn(),
      findActiveByTokenHash: jest.fn(),
      rotate: jest.fn(),
      revoke: jest.fn(),
    }
    sut = new VerifyOtpUseCase(
      repository,
      otpService,
      tokenService,
      accountsRepository,
      refreshTokenSessionsRepository,
    )
  })

  it('should consume a valid challenge and return an access token', async () => {
    repository.findActiveById.mockResolvedValue(otpChallenge)
    otpService.validateOtp.mockReturnValue(true)
    accountsRepository.getById.mockResolvedValue(account)
    tokenService.generate.mockResolvedValue({ accessToken: 'access-token' })
    tokenService.generateRefreshToken.mockReturnValue({
      refreshToken: 'refresh-token',
      tokenHash: 'refresh-token-hash',
      expiresAt: new Date('2026-02-01T00:00:00.000Z'),
    })

    const result = await sut.execute({ otp: '123456', otpId: otpChallenge.id })

    expect(repository.findActiveById).toHaveBeenCalledWith(otpChallenge.id)
    expect(otpService.validateOtp).toHaveBeenCalledWith(
      '123456',
      otpChallenge.codeHash,
    )
    expect(repository.consume).toHaveBeenCalledWith(otpChallenge.id)
    expect(accountsRepository.getById).toHaveBeenCalledWith(account.id)
    expect(tokenService.generate).toHaveBeenCalledWith({
      clientId: account.id,
      role: account.role,
      sessionId: expect.any(String),
    })
    expect(refreshTokenSessionsRepository.create).toHaveBeenCalledWith({
      id: expect.any(String),
      accountId: account.id,
      tokenHash: 'refresh-token-hash',
      expiresAt: new Date('2026-02-01T00:00:00.000Z'),
    })
    expect(result).toEqual({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    })
  })

  it('should reject when the challenge is not active', async () => {
    repository.findActiveById.mockResolvedValue(undefined)

    await expect(
      sut.execute({ otp: '123456', otpId: 'missing-id' }),
    ).rejects.toThrow(new UnauthorizedException('Invalid OTP'))

    expect(otpService.validateOtp).not.toHaveBeenCalled()
    expect(repository.consume).not.toHaveBeenCalled()
    expect(tokenService.generate).not.toHaveBeenCalled()
  })

  it('should reject an invalid OTP', async () => {
    repository.findActiveById.mockResolvedValue(otpChallenge)
    otpService.validateOtp.mockReturnValue(false)

    await expect(
      sut.execute({ otp: '654321', otpId: otpChallenge.id }),
    ).rejects.toThrow(new UnauthorizedException('Invalid OTP'))

    expect(repository.consume).not.toHaveBeenCalled()
    expect(accountsRepository.getById).not.toHaveBeenCalled()
    expect(tokenService.generate).not.toHaveBeenCalled()
  })

  it('should consume a challenge that reached the attempt limit', async () => {
    const exhaustedChallenge = { ...otpChallenge, attempts: 3 }
    repository.findActiveById.mockResolvedValue(exhaustedChallenge)
    otpService.validateOtp.mockReturnValue(false)

    await expect(
      sut.execute({ otp: '654321', otpId: exhaustedChallenge.id }),
    ).rejects.toBeInstanceOf(UnauthorizedException)

    expect(repository.consume).toHaveBeenCalledWith(exhaustedChallenge.id)
    expect(tokenService.generate).not.toHaveBeenCalled()
  })

  it('should reject when the challenge account no longer exists', async () => {
    repository.findActiveById.mockResolvedValue(otpChallenge)
    otpService.validateOtp.mockReturnValue(true)
    accountsRepository.getById.mockResolvedValue(undefined)

    await expect(
      sut.execute({ otp: '123456', otpId: otpChallenge.id }),
    ).rejects.toThrow(new UnauthorizedException('Account not found'))

    expect(repository.consume).toHaveBeenCalledWith(otpChallenge.id)
    expect(tokenService.generate).not.toHaveBeenCalled()
  })
})
