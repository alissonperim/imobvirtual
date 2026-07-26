import { Module } from '@nestjs/common'
import { RequestOtpUseCase } from './use-cases/request-otp.use-case'
import { OtpService } from './services/otp.service'
import { AccountService } from '@app/accounts/services/register.service'

@Module({
  providers: [
    {
      provide: 'REQUEST_OTP_USE_CASE',
      useClass: RequestOtpUseCase,
    },
    {
      provide: 'OTP_SERVICE',
      useClass: OtpService,
    },
  ],
  exports: [OtpService],
  imports: [AccountService],
})
export class OtpModule {}
