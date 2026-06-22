import { Body, Controller, Inject, Injectable, Post } from '@nestjs/common'
import type { IRequestOtpUseCase } from './use-cases/request-otp.use-case'
import type { IVerifyOtpUseCase } from './use-cases/verify-otp.use-case'
import type { IRefreshTokenUseCase } from './use-cases/refresh-token.use-case'
import type { RefreshTokenInput, TokenPair } from './domain/session'
import type {
  RequestOtpInput,
  RequestOtpOutput,
  VerifyOtpInput,
  VerifyOtpOutput,
} from './domain/otp'

@Controller('auth')
@Injectable()
export class AuthController {
  constructor(
    @Inject('REQUEST_OTP_USE_CASE')
    private readonly requestOtpUseCase: IRequestOtpUseCase,

    @Inject('VERIFY_OTP_USE_CASE')
    private readonly verifyOtpUseCase: IVerifyOtpUseCase,

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

  @Post('/otp-challenge')
  async challengeOtp(
    @Body()
    params: VerifyOtpInput,
  ): Promise<VerifyOtpOutput> {
    return this.verifyOtpUseCase.execute(params)
  }

  @Post('/refresh')
  async refresh(@Body() params: RefreshTokenInput): Promise<TokenPair> {
    return this.refreshTokenUseCase.execute(params)
  }
}
