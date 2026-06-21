import { Module } from '@nestjs/common'
import { OtpService } from './services/otp-service'
import { OtpChallengesRepository } from './repositories/implementations/otp-challenge-repository'
import { TokenService } from './services/token-service'

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
  ],
})
export class AuthModule {}
