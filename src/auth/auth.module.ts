import { Module } from '@nestjs/common'
import { JwtAuthGuard } from './guards/jwt-auth.guard'
import { TokenService } from './services/token.service'
import { AuthController } from './auth.controllers'
import { AccountsModule } from '@app/accounts/accounts.module'
import { SessionsRepository } from './repositories/implementations/sessions.repository'
import { RefreshTokenUseCase } from './use-cases/refresh-token.use-case'
import { SignInOtpConsumeUseCase } from './use-cases/sign-in-otp.use-case'
import { SignUpOtpConsumeUseCase } from './use-cases/sign-up-otp.use-case'
import { OtpModule } from '@app/otp/otp.module'

@Module({
  providers: [
    {
      provide: 'REFRESH_TOKEN_SESSIONS_REPOSITORY',
      useClass: SessionsRepository,
    },
    {
      provide: 'ACCESS_TOKEN_SERVICE',
      useClass: TokenService,
    },
    {
      provide: 'REFRESH_TOKEN_USE_CASE',
      useClass: RefreshTokenUseCase,
    },
    {
      provide: 'SIGN_IN_OTP_USE_CASE',
      useClass: SignInOtpConsumeUseCase,
    },
    {
      provide: 'SIGN_UP_OTP_USE_CASE',
      useClass: SignUpOtpConsumeUseCase,
    },
    JwtAuthGuard,
  ],
  controllers: [AuthController],
  imports: [AccountsModule, OtpModule],
  exports: [JwtAuthGuard],
})
export class AuthModule {}
