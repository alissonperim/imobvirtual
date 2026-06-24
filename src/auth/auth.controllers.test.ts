import { EAccountRole, EOtpChannel, EOtpPurpose } from '@pkg/types'
import type { IRefreshTokenUseCase } from './use-cases/refresh-token.use-case'
import type { IRequestOtpUseCase } from './use-cases/request-otp.use-case'
import type { IVerifySignInOtpUseCase } from './use-cases/verify-sign-in-otp.use-case'
import type { IVerifySignUpOtpUseCase } from './use-cases/verify-sign-up-otp.use-case'
import { AuthController } from './auth.controllers'

describe('AuthController', () => {
  let requestOtpUseCase: jest.Mocked<IRequestOtpUseCase>
  let verifySignInOtpUseCase: jest.Mocked<IVerifySignInOtpUseCase>
  let verifySignUpOtpUseCase: jest.Mocked<IVerifySignUpOtpUseCase>
  let refreshTokenUseCase: jest.Mocked<IRefreshTokenUseCase>
  let controller: AuthController

  beforeEach(() => {
    requestOtpUseCase = { execute: jest.fn() }
    verifySignInOtpUseCase = { execute: jest.fn() }
    verifySignUpOtpUseCase = { execute: jest.fn() }
    refreshTokenUseCase = { execute: jest.fn() }
    controller = new AuthController(
      requestOtpUseCase,
      verifySignInOtpUseCase,
      verifySignUpOtpUseCase,
      refreshTokenUseCase,
    )
  })

  it('should delegate sign-in verification to its use case', async () => {
    const input = { otpId: 'otp-id', otp: '123456' }
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
    }
    const output = { accessToken: 'access', refreshToken: 'refresh' }
    verifySignUpOtpUseCase.execute.mockResolvedValue(output)

    await expect(controller.signUpChallengeOtp(input)).resolves.toEqual(output)
    expect(verifySignUpOtpUseCase.execute).toHaveBeenCalledWith(input)
    expect(verifySignInOtpUseCase.execute).not.toHaveBeenCalled()
  })

  it('should delegate OTP requests with their purpose', async () => {
    const input = {
      destination: '+5562999824266',
      channel: EOtpChannel.SMS,
      purpose: EOtpPurpose.SIGN_UP,
    }
    const output = {
      otpChallengeId: 'otp-id',
      expiresIn: 360,
      purpose: EOtpPurpose.SIGN_UP,
    }
    requestOtpUseCase.execute.mockResolvedValue(output)

    await expect(controller.requestOtp(input)).resolves.toEqual(output)
    expect(requestOtpUseCase.execute).toHaveBeenCalledWith(input)
  })
})
