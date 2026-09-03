import { UnauthorizedException } from '@nestjs/common'
import type { IAccountService } from '@app/accounts/services/register.service'
import {
  EAccountRole,
  EAccountStatus,
  EOtpChannel,
  EOtpPurpose,
  type Account,
  type Otp,
  type Session,
} from '@pkg/types'
import type { ISessionsRepository } from '../../repositories/session.domain'
import type { IOtpService } from '@app/otp/services/otp.service'
import type { ITokenService } from '../../services/token.service'
import { SignInOtpConsumeUseCase } from '../sign-in-otp.use-case'
import type { SignInInput } from '../../domain/session'

describe('SignInOtpConsumeUseCase', () => {
  let otpService: jest.Mocked<IOtpService>
  let tokenService: jest.Mocked<ITokenService>
  let accountService: jest.Mocked<IAccountService>
  let sessionsRepository: jest.Mocked<ISessionsRepository>
  let sut: SignInOtpConsumeUseCase

  const account: Account = {
    id: 'account-id',
    role: EAccountRole.OWNER,
    status: EAccountStatus.ACTIVE,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  }

  const validatedOtp: Otp = {
    id: 'otp-challenge-id',
    destination: '62999824266',
    purpose: EOtpPurpose.SIGN_IN,
    channel: EOtpChannel.SMS,
    codeHash: 'otp-hash',
    expiresAt: new Date('2026-01-01T00:15:00.000Z'),
    attempts: 0,
    accountId: account.id,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  }

  const input: SignInInput = {
    otpId: 'otp-challenge-id',
    otp: '123456',
  }

  beforeEach(() => {
    otpService = {
      getAndValidate: jest.fn(),
      createOtp: jest.fn(),
    }
    tokenService = {
      generate: jest.fn(),
      generateRefreshToken: jest.fn(),
      hashRefreshToken: jest.fn(),
    }
    accountService = {
      register: jest.fn(),
      getAccount: jest.fn(),
      createPendingRegistrationUser: jest.fn(),
    }
    sessionsRepository = {
      create: jest.fn(),
      findActiveByTokenHash: jest.fn(),
      rotate: jest.fn(),
      revoke: jest.fn(),
    }
    sut = new SignInOtpConsumeUseCase(
      otpService,
      tokenService,
      accountService,
      sessionsRepository,
    )
  })

  it('should validate the OTP and return an access/refresh token pair', async () => {
    otpService.getAndValidate.mockResolvedValue(validatedOtp)
    accountService.getAccount.mockResolvedValue(account)
    sessionsRepository.create.mockResolvedValue({ id: 'session-id' } as Session)
    tokenService.generateRefreshToken.mockReturnValue({
      refreshToken: 'refresh-token',
      tokenHash: 'refresh-token-hash',
      expiresAt: new Date('2026-02-01T00:00:00.000Z'),
    })
    tokenService.generate.mockResolvedValue({ accessToken: 'access-token' })

    const result = await sut.execute(input)

    expect(otpService.getAndValidate).toHaveBeenCalledWith({
      otp: input.otp,
      otpId: input.otpId,
      purpose: EOtpPurpose.SIGN_IN,
    })
    expect(accountService.getAccount).toHaveBeenCalledWith({
      id: validatedOtp.accountId,
    })
    expect(sessionsRepository.create).toHaveBeenCalledWith({
      accountId: account.id,
      tokenHash: 'refresh-token-hash',
      expiresAt: new Date('2026-02-01T00:00:00.000Z'),
    })
    expect(tokenService.generate).toHaveBeenCalledWith({
      clientId: account.id,
      role: account.role,
      sessionId: 'session-id',
    })
    expect(result).toEqual({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    })
  })

  it('should propagate the error and not issue tokens when the OTP is invalid', async () => {
    otpService.getAndValidate.mockRejectedValue(
      new UnauthorizedException('Invalid OTP'),
    )

    await expect(sut.execute(input)).rejects.toThrow(
      new UnauthorizedException('Invalid OTP'),
    )

    expect(accountService.getAccount).not.toHaveBeenCalled()
    expect(sessionsRepository.create).not.toHaveBeenCalled()
    expect(tokenService.generate).not.toHaveBeenCalled()
  })
})
