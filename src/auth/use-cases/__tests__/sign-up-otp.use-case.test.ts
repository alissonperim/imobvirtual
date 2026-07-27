import { UnauthorizedException } from '@nestjs/common'
import type { IAccountService } from '@app/accounts/services/register.service'
import type { RegisterAccountOutput } from '@app/accounts/domain/account'
import {
  EAccountRole,
  EAccountStatus,
  EOtpChannel,
  EOtpPurpose,
  type Otp,
  type Session,
} from '@pkg/types'
import type { ISessionsRepository } from '../../repositories/session.domain'
import type { IOtpService } from '@app/otp/services/otp.service'
import type { ITokenService } from '../../services/token.service'
import { SignUpOtpConsumeUseCase } from '../sign-up-otp.use-case'
import type { SignUpInput } from '../../domain/session'

describe('SignUpOtpConsumeUseCase', () => {
  let otpService: jest.Mocked<IOtpService>
  let tokenService: jest.Mocked<ITokenService>
  let accountService: jest.Mocked<IAccountService>
  let sessionsRepository: jest.Mocked<ISessionsRepository>
  let sut: SignUpOtpConsumeUseCase

  const account: RegisterAccountOutput = {
    id: 'account-id',
    role: EAccountRole.RENTER,
    status: EAccountStatus.ACTIVE,
  }

  const validatedOtp: Otp = {
    id: 'otp-challenge-id',
    destination: '62999824266',
    purpose: EOtpPurpose.SIGN_UP,
    channel: EOtpChannel.SMS,
    codeHash: 'otp-hash',
    expiresAt: new Date('2026-01-01T00:15:00.000Z'),
    attempts: 0,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  }

  const input: SignUpInput = {
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
    sut = new SignUpOtpConsumeUseCase(
      tokenService,
      sessionsRepository,
      otpService,
      accountService,
    )
  })

  it('should validate the OTP, register the account and return a token pair', async () => {
    otpService.getAndValidate.mockResolvedValue(validatedOtp)
    accountService.register.mockResolvedValue(account)
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
    })
    expect(accountService.register).toHaveBeenCalledWith(validatedOtp)
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

  it('should propagate the error and not register an account when the OTP is invalid', async () => {
    otpService.getAndValidate.mockRejectedValue(
      new UnauthorizedException('Invalid OTP'),
    )

    await expect(sut.execute(input)).rejects.toThrow(
      new UnauthorizedException('Invalid OTP'),
    )

    expect(accountService.register).not.toHaveBeenCalled()
    expect(sessionsRepository.create).not.toHaveBeenCalled()
    expect(tokenService.generate).not.toHaveBeenCalled()
  })
})
