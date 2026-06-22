import { Module } from '@nestjs/common'
import { OtpService } from './services/otp.service'
import { OtpChallengesRepository } from './repositories/implementations/otp.repository'
import { TokenService } from './services/token.service'
import { AuthController } from './auth.controllers'
import { RequestOtpUseCase } from './use-cases/request-otp.use-case'
import { VerifySignInOtpUseCase } from './use-cases/verify-sign-in-otp.use-case'
import { AccountsModule } from '@app/accounts/accounts.module'
import { RefreshTokenSessionsRepository } from './repositories/implementations/sessions.repository'
import { RefreshTokenUseCase } from './use-cases/refresh-token.use-case'
import { VerifySignUpOtpUseCase } from './use-cases/verify-sign-up-otp.use-case'

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
      provide: 'REFRESH_TOKEN_SESSIONS_REPOSITORY',
      useClass: RefreshTokenSessionsRepository,
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
      provide: 'VERIFY_SIGN_IN_OTP_USE_CASE',
      useClass: VerifySignInOtpUseCase,
    },
    {
      provide: 'VERIFY_SIGN_UP_OTP_USE_CASE',
      useClass: VerifySignUpOtpUseCase,
    },
    {
      provide: 'REFRESH_TOKEN_USE_CASE',
      useClass: RefreshTokenUseCase,
    },
  ],
  controllers: [AuthController],
  imports: [AccountsModule],
})
export class AuthModule {}
