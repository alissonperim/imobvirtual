import { Module } from '@nestjs/common'
import { JwtAuthGuard } from './guards/jwt-auth.guard'
import { TokenService } from './services/token.service'
import { AuthController } from './auth.controllers'
import { AccountsModule } from '@app/accounts/accounts.module'
import { SessionsRepository } from './repositories/implementations/sessions.repository'
import { RefreshTokenUseCase } from './use-cases/refresh-token.use-case'
import { AccountService } from '@app/accounts/services/register.service'

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
      provide: 'ACCOUNT_SERVICE',
      useClass: AccountService,
    },
    JwtAuthGuard,
  ],
  controllers: [AuthController],
  imports: [AccountsModule],
  exports: [JwtAuthGuard],
})
export class AuthModule {}
