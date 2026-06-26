import { Body, Controller, Inject, Injectable, Post } from '@nestjs/common'
import { Public } from './decorators/public.decorator'
import type { IRequestOtpUseCase } from './use-cases/request-otp.use-case'
import type { IVerifySignInOtpUseCase } from './use-cases/verify-sign-in-otp.use-case'
import type { IVerifySignUpOtpUseCase } from './use-cases/verify-sign-up-otp.use-case'
import type { IRefreshTokenUseCase } from './use-cases/refresh-token.use-case'
import { RefreshTokenInput } from './domain/session'
import type { TokenPair } from './domain/session'
import {
  RequestOtpInput,
  VerifySignInOtpInput,
  VerifySignUpOtpInput,
} from './domain/otp'
import type { RequestOtpOutput, VerifyOtpOutput } from './domain/otp'

@Public()
@Controller('auth')
@Injectable()
export class AuthController {
  constructor(
    @Inject('REQUEST_OTP_USE_CASE')
    private readonly requestOtpUseCase: IRequestOtpUseCase,

    @Inject('VERIFY_SIGN_IN_OTP_USE_CASE')
    private readonly verifySignInOtpUseCase: IVerifySignInOtpUseCase,

    @Inject('VERIFY_SIGN_UP_OTP_USE_CASE')
    private readonly verifySignUpOtpUseCase: IVerifySignUpOtpUseCase,

    @Inject('REFRESH_TOKEN_USE_CASE')
    private readonly refreshTokenUseCase: IRefreshTokenUseCase,
  ) {}

  @Post('/otp')
  async requestOtp(
    @Body()
    params: RequestOtpInput,
  ): Promise<RequestOtpOutput> {
    return this.requestOtpUseCase.execute(params)
  }

  @Post('/signin/otp-challenge')
  async signInChallengeOtp(
    @Body()
    params: VerifySignInOtpInput,
  ): Promise<VerifyOtpOutput> {
    return this.verifySignInOtpUseCase.execute(params)
  }

  @Post('/signup/otp-challenge')
  async signUpChallengeOtp(
    @Body()
    params: VerifySignUpOtpInput,
  ): Promise<VerifyOtpOutput> {
    return this.verifySignUpOtpUseCase.execute(params)
  }

  @Post('/refresh')
  async refresh(@Body() params: RefreshTokenInput): Promise<TokenPair> {
    return this.refreshTokenUseCase.execute(params)
  }
}
