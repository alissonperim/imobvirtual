import { Module } from '@nestjs/common'
import { OtpService } from './services/otp-service'
import { OtpChallengesRepository } from './repositories/implementations/otp-challenge-repository'

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
  ],
})
export class AuthModule {}
