import { Module } from '@nestjs/common'
import { OtpService } from './services/otp-service'
import { OtpChallengesRepository } from './repositories/implementations/otp-challenge-repository'
import { TokenService } from './services/token-service'
import { AuthController } from './auth.controllers'
import { RequestOtpUseCase } from './use-cases/request-otp-use-case'
import { VerifyOtpUseCase } from './use-cases/verify-otp-use-case'
import { AccountsModule } from '@app/accounts/accounts.module'

@Module({
  providers: [
    {
      provide: 'OTP_SERVICE',
      useClass: OtpService,
    },
    {
      provide: 'OTP_REPOSITORY',
      useClass: OtpChallengesRepository,
    },
    {
      provide: 'ACCESS_TOKEN_SERVICE',
      useClass: TokenService,
    },
    {
      provide: 'REQUEST_OTP_USE_CASE',
      useClass: RequestOtpUseCase,
    },
    {
      provide: 'VERIFY_OTP_USE_CASE',
      useClass: VerifyOtpUseCase,
    },
  ],
  controllers: [AuthController],
  imports: [AccountsModule],
})
export class AuthModule {}
