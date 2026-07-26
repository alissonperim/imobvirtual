import { UnauthorizedException } from '@nestjs/common'
import type { IAccountService } from '@app/accounts/services/register.service'
import { EAccountRole, EAccountStatus, type Account } from '@pkg/types'
import type { ISessionsRepository } from '../../repositories/session.domain'
import type { IOtpService } from '@app/otp/services/otp.service'
import type { ITokenService } from '../../services/token.service'
import { SignInOtpUseCase } from '../sign-in-otp.use-case'
import type { Session, SignInInput } from '../../domain/session'

describe('SignInOtpUseCase', () => {
  let otpService: jest.Mocked<IOtpService>
  let tokenService: jest.Mocked<ITokenService>
  let accountService: jest.Mocked<IAccountService>
  let sessionsRepository: jest.Mocked<ISessionsRepository>
  let sut: SignInOtpUseCase

  const account: Account = {
    id: 'account-id',
    role: EAccountRole.OWNER,
    status: EAccountStatus.ACTIVE,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  }

  const input: SignInInput = {
    role: EAccountRole.OWNER,
    name: 'John',
    lastName: 'Doe',
    phoneNumber: '62999824266',
    email: 'john@doe.com',
    otpId: 'otp-challenge-id',
    otp: '123456',
    customerId: 'customer-id',
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
    sut = new SignInOtpUseCase(
      otpService,
      tokenService,
      accountService,
      sessionsRepository,
    )
  })

  it('should validate the OTP and return an access/refresh token pair', async () => {
    otpService.validate.mockResolvedValue(undefined)
    accountService.getAccount.mockResolvedValue(account)
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
    expect(accountService.getAccount).toHaveBeenCalledWith({
      role: input.role,
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

  it('should propagate the error and not issue tokens when the OTP is invalid', async () => {
    otpService.validate.mockRejectedValue(
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
