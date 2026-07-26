import { Body, Controller, Inject, Injectable, Post } from '@nestjs/common'
import { Public } from './decorators/public.decorator'
import type { SignInOtpConsumeUseCase } from './use-cases/sign-in-otp.use-case'
import type { ISignUpOtpConsumeUseCase } from './use-cases/sign-up-otp.use-case'
import type { IRefreshTokenUseCase } from './use-cases/refresh-token.use-case'
import { RefreshTokenInput } from './domain/session'
import type { SignInInput, SignUpInput, TokenPair } from './domain/session'
import type { VerifyOtpOutput } from '../otp/domain/otp'
import { YupValidationPipe } from '@pkg/utils'
import { SignInOtpChallengeInputSchema } from './schemas'

@Public()
@Controller('auth')
@Injectable()
export class AuthController {
  constructor(
    @Inject('SIGN_IN_OTP_USE_CASE')
    private readonly signInOtpUseCase: SignInOtpConsumeUseCase,

    @Inject('SIGN_UP_OTP_USE_CASE')
    private readonly signUpOtpUseCase: ISignUpOtpConsumeUseCase,

    @Inject('REFRESH_TOKEN_USE_CASE')
    private readonly refreshTokenUseCase: IRefreshTokenUseCase,
  ) {}

  @Post('/signin/otp-challenge')
  async signInChallengeOtp(
    @Body(new YupValidationPipe(SignInOtpChallengeInputSchema))
    params: SignInInput,
  ): Promise<VerifyOtpOutput> {
    return this.signInOtpUseCase.execute(params)
  }

  @Post('/signup/otp-challenge')
  async signUpChallengeOtp(
    @Body()
    params: SignUpInput,
  ): Promise<VerifyOtpOutput> {
    return this.signUpOtpUseCase.execute(params)
  }

  @Post('/refresh')
  async refresh(@Body() params: RefreshTokenInput): Promise<TokenPair> {
    return this.refreshTokenUseCase.execute(params)
  }
}
