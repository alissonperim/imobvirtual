import { Public } from '@app/auth/decorators/public.decorator'
import { Body, Controller, Inject, Injectable, Post } from '@nestjs/common'
import type { IRequestOtpUseCase } from './use-cases/request-otp.use-case'
import { YupValidationPipe } from '@pkg/utils'
import { requestOtpSchema } from './schemas/request-otp.schema'
import type { RequestOtpInput, RequestOtpOutput } from './domain'

@Controller('otp')
@Public()
@Injectable()
export class OtpController {
  constructor(
    @Inject('REQUEST_OTP_USE_CASE')
    private readonly requestOtpUseCase: IRequestOtpUseCase,
  ) {}

  @Post()
  async requestOtp(
    @Body(new YupValidationPipe(requestOtpSchema))
    params: RequestOtpInput,
  ): Promise<RequestOtpOutput> {
    return this.requestOtpUseCase.execute(params)
  }
}
