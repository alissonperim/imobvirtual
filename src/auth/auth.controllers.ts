import { Body, Controller, Inject, Injectable, Post } from '@nestjs/common'
import type { IRequestOtpUseCase } from './use-cases/request-otp-use-case'
import type { IVerifyOtpUseCase } from './use-cases/verify-otp-use-case'
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
}
