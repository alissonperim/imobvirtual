import { UnauthorizedException } from '@nestjs/common'
import type { IAccountService } from '@app/accounts/services/register.service'
import type { RegisterAccountOutput } from '@app/accounts/domain/account'
import { EAccountRole, EAccountStatus } from '@pkg/types'
import type { ISessionsRepository } from '../../repositories/session.domain'
import type { IOtpService } from '@app/otp/services/otp.service'
import type { ITokenService } from '../../services/token.service'
import { SignUpOtpConsumeUseCase } from '../sign-up-otp.use-case'
import type { Session, SignUpInput } from '../../domain/session'

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

  const input: SignUpInput = {
    role: EAccountRole.RENTER,
    name: 'Maria',
    lastName: 'Silva',
    phoneNumber: '62999824266',
    email: 'maria@silva.com',
    otpId: 'otp-challenge-id',
    otp: '123456',
  }

  beforeEach(() => {
    otpService = {
      validate: jest.fn(),
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
    otpService.validate.mockResolvedValue(undefined)
    accountService.register.mockResolvedValue(account)
    sessionsRepository.create.mockResolvedValue({ id: 'session-id' } as Session)
    tokenService.generateRefreshToken.mockReturnValue({
      refreshToken: 'refresh-token',
      tokenHash: 'refresh-token-hash',
      expiresAt: new Date('2026-02-01T00:00:00.000Z'),
    })
    tokenService.generate.mockResolvedValue({ accessToken: 'access-token' })

    const result = await sut.execute(input)

    expect(otpService.validate).toHaveBeenCalledWith({
      otp: input.otp,
      otpId: input.otpId,
    })
    expect(accountService.register).toHaveBeenCalledWith({
      email: input.email,
      role: input.role,
      name: input.name,
      lastName: input.lastName,
      phoneNumber: input.phoneNumber,
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

  it('should propagate the error and not register an account when the OTP is invalid', async () => {
    otpService.validate.mockRejectedValue(
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
