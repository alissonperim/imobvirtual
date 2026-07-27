import { Module } from '@nestjs/common'
import { RequestOtpUseCase } from './use-cases/request-otp.use-case'
import { OtpService } from './services/otp.service'
import { AccountsModule } from '@app/accounts/accounts.module'
import { OtpRepository } from './repository/impl/otp.repository'
import { OtpController } from './otp.controller'

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
    {
      provide: 'OTP_REPOSITORY',
      useClass: OtpRepository,
    },
  ],
  controllers: [OtpController],
  exports: ['OTP_SERVICE'],
  imports: [AccountsModule],
})
export class OtpModule {}
