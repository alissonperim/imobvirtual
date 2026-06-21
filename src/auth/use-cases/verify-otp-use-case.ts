import { Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import type { IOtpChallengesRepository } from '../repositories/domain'
import type { IOtpService } from '../services/otp-service'
import type { ITokenService } from '../services/token-service'
import type { IAccountsRepository } from '@app/accounts/repositories/domain'

export interface IVerifyOtpUseCase {
  execute(
    otp: string,
    otpId: string,
    accountId: string,
  ): Promise<{ accessToken: string }>
}

@Injectable()
export class VerifyOtpUseCase implements IVerifyOtpUseCase {
  constructor(
    @Inject('OTP_REPOSITORY')
    private readonly repository: IOtpChallengesRepository,

    @Inject('OTP_SERVICE')
    private readonly service: IOtpService,

    @Inject('ACCESS_TOKEN_SERVICE')
    private readonly tokenService: ITokenService,

    @Inject('ACCOUNTS_REPOSITORY')
    private readonly accountsRepository: IAccountsRepository,
  ) {}

  async execute(otp: string, otpId: string): Promise<{ accessToken: string }> {
    const challengOtp = await this.repository.findActiveById(otpId)

    if (!challengOtp) {
      throw new UnauthorizedException('Invalid OTP')
    }

    if (challengOtp.attempts >= 3) {
      await this.repository.consume(challengOtp.id)
    }

    const isOtpValid = this.service.validateOtp(otp, challengOtp.codeHash)

    if (!isOtpValid) {
      throw new UnauthorizedException('Invalid OTP')
    }

    await this.repository.consume(challengOtp.id)
    const account = await this.accountsRepository.getById(challengOtp.accountId)

    if (!account) {
      throw new UnauthorizedException('Account not found')
    }

    const accessToken = this.tokenService.generate({
      clientId: account.id,
      role: account.role,
    })

    return accessToken
  }
}
