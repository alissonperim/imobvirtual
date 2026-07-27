import type { IRefreshTokenUseCase } from './use-cases/refresh-token.use-case'
import type {
  ISignInOtpConsumeUseCase,
  SignInOtpConsumeUseCase,
} from './use-cases/sign-in-otp.use-case'
import type { ISignUpOtpConsumeUseCase } from './use-cases/sign-up-otp.use-case'
import { AuthController } from './auth.controllers'

describe('AuthController', () => {
  let signInOtpUseCase: jest.Mocked<ISignInOtpConsumeUseCase>
  let signUpOtpUseCase: jest.Mocked<ISignUpOtpConsumeUseCase>
  let refreshTokenUseCase: jest.Mocked<IRefreshTokenUseCase>
  let controller: AuthController

  beforeEach(() => {
    signInOtpUseCase = { execute: jest.fn() }
    signUpOtpUseCase = { execute: jest.fn() }
    refreshTokenUseCase = { execute: jest.fn() }
    controller = new AuthController(
      signInOtpUseCase as unknown as SignInOtpConsumeUseCase,
      signUpOtpUseCase,
      refreshTokenUseCase,
    )
  })

  it('should delegate sign-in verification to its use case', async () => {
    const input = { otpId: 'otp-id', otp: '123456' }
    const output = { accessToken: 'access', refreshToken: 'refresh' }
    signInOtpUseCase.execute.mockResolvedValue(output)

    await expect(controller.signInChallengeOtp(input)).resolves.toEqual(output)
    expect(signInOtpUseCase.execute).toHaveBeenCalledWith(input)
    expect(signUpOtpUseCase.execute).not.toHaveBeenCalled()
  })

  it('should delegate sign-up verification to its use case', async () => {
    const input = { otpId: 'otp-id', otp: '123456' }
    const output = { accessToken: 'access', refreshToken: 'refresh' }
    signUpOtpUseCase.execute.mockResolvedValue(output)

    await expect(controller.signUpChallengeOtp(input)).resolves.toEqual(output)
    expect(signUpOtpUseCase.execute).toHaveBeenCalledWith(input)
    expect(signInOtpUseCase.execute).not.toHaveBeenCalled()
  })

  it('should delegate refresh requests to its use case', async () => {
    const input = { refreshToken: 'refresh-token' }
    const output = { accessToken: 'access', refreshToken: 'refresh' }
    refreshTokenUseCase.execute.mockResolvedValue(output)

    await expect(controller.refresh(input)).resolves.toEqual(output)
    expect(refreshTokenUseCase.execute).toHaveBeenCalledWith(input)
  })
})
