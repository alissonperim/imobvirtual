import { EAccountRole } from '@pkg/types'
import type { IRefreshTokenUseCase } from './use-cases/refresh-token.use-case'
import type { IVerifySignInOtpUseCase } from './use-cases/sign-in-otp.use-case'
import type { IVerifySignUpOtpUseCase } from './use-cases/sign-up-otp.use-case'
import { AuthController } from './auth.controllers'

describe('AuthController', () => {
  let verifySignInOtpUseCase: jest.Mocked<IVerifySignInOtpUseCase>
  let verifySignUpOtpUseCase: jest.Mocked<IVerifySignUpOtpUseCase>
  let refreshTokenUseCase: jest.Mocked<IRefreshTokenUseCase>
  let controller: AuthController

  beforeEach(() => {
    verifySignInOtpUseCase = { execute: jest.fn() }
    verifySignUpOtpUseCase = { execute: jest.fn() }
    refreshTokenUseCase = { execute: jest.fn() }
    controller = new AuthController(
      verifySignInOtpUseCase,
      verifySignUpOtpUseCase,
      refreshTokenUseCase,
    )
  })

  it('should delegate sign-in verification to its use case', async () => {
    const input = { otpId: 'otp-id', otp: '123456' } as never
    const output = { accessToken: 'access', refreshToken: 'refresh' }
    verifySignInOtpUseCase.execute.mockResolvedValue(output)

    await expect(controller.signInChallengeOtp(input)).resolves.toEqual(output)
    expect(verifySignInOtpUseCase.execute).toHaveBeenCalledWith(input)
    expect(verifySignUpOtpUseCase.execute).not.toHaveBeenCalled()
  })

  it('should delegate sign-up verification to its use case', async () => {
    const input = {
      otpId: 'otp-id',
      otp: '123456',
      name: 'Maria',
      role: EAccountRole.RENTER,
    } as never
    const output = { accessToken: 'access', refreshToken: 'refresh' }
    verifySignUpOtpUseCase.execute.mockResolvedValue(output)

    await expect(controller.signUpChallengeOtp(input)).resolves.toEqual(output)
    expect(verifySignUpOtpUseCase.execute).toHaveBeenCalledWith(input)
    expect(verifySignInOtpUseCase.execute).not.toHaveBeenCalled()
  })

  it('should delegate refresh requests to its use case', async () => {
    const input = { refreshToken: 'refresh-token' }
    const output = { accessToken: 'access', refreshToken: 'refresh' }
    refreshTokenUseCase.execute.mockResolvedValue(output)

    await expect(controller.refresh(input)).resolves.toEqual(output)
    expect(refreshTokenUseCase.execute).toHaveBeenCalledWith(input)
  })
})
