import { Body, Controller, Inject, Injectable, Post } from '@nestjs/common'
import { Public } from './decorators/public.decorator'
import type { IVerifySignInOtpUseCase } from './use-cases/sign-in-otp.use-case'
import type { IVerifySignUpOtpUseCase } from './use-cases/sign-up-otp.use-case'
import type { IRefreshTokenUseCase } from './use-cases/refresh-token.use-case'
import { RefreshTokenInput } from './domain/session'
import type { SignInInput, SignUpInput, TokenPair } from './domain/session'
import type { VerifyOtpOutput } from '../otp/domain/otp'

@Public()
@Controller('auth')
@Injectable()
export class AuthController {
  constructor(
    @Inject('VERIFY_SIGN_IN_OTP_USE_CASE')
    private readonly verifySignInOtpUseCase: IVerifySignInOtpUseCase,

    @Inject('VERIFY_SIGN_UP_OTP_USE_CASE')
    private readonly verifySignUpOtpUseCase: IVerifySignUpOtpUseCase,

    @Inject('REFRESH_TOKEN_USE_CASE')
    private readonly refreshTokenUseCase: IRefreshTokenUseCase,
  ) {}

  @Post('/signin/otp-challenge')
  async signInChallengeOtp(
    @Body()
    params: SignInInput,
  ): Promise<VerifyOtpOutput> {
    return this.verifySignInOtpUseCase.execute(params)
  }

  @Post('/signup/otp-challenge')
  async signUpChallengeOtp(
    @Body()
    params: SignUpInput,
  ): Promise<VerifyOtpOutput> {
    return this.verifySignUpOtpUseCase.execute(params)
  }

  @Post('/refresh')
  async refresh(@Body() params: RefreshTokenInput): Promise<TokenPair> {
    return this.refreshTokenUseCase.execute(params)
  }
}
