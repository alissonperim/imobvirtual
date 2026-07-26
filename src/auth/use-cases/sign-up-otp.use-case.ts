import { Inject, Injectable, Logger } from '@nestjs/common'
import type { ITokenService } from '../services/token.service'
import type { ISessionsRepository } from '../repositories/session.domain'
import type { IOtpService } from '@app/otp/services/otp.service'
import type { SignUpInput } from '../domain/session'
import type { IAccountService } from '@app/accounts/services/register.service'

export interface IVerifySignUpOtpUseCase {
  execute(
    params: SignUpInput,
  ): Promise<{ accessToken: string; refreshToken: string }>
}

@Injectable()
export class SignUpOtpConsumeUseCase implements IVerifySignUpOtpUseCase {
  private readonly logger = new Logger(SignUpOtpConsumeUseCase.name)

  constructor(
    @Inject('ACCESS_TOKEN_SERVICE')
    private readonly tokenService: ITokenService,

    @Inject('REFRESH_TOKEN_SESSIONS_REPOSITORY')
    private readonly sessionsRepository: ISessionsRepository,

    @Inject('OTP_SERVICE')
    private readonly otpService: IOtpService,

    @Inject('ACCOUNT_SERVICE')
    private readonly accountService: IAccountService,
  ) {}

  async execute(
    params: SignUpInput,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const otp = await this.otpService.getAndValidate({
      otp: params.otp,
      otpId: params.otpId,
    })

    const account = await this.accountService.register(otp.id)

    const refreshTokenData = this.tokenService.generateRefreshToken()

    const session = await this.sessionsRepository.create({
      accountId: account.id,
      tokenHash: refreshTokenData.tokenHash,
      expiresAt: refreshTokenData.expiresAt,
    })

    const { accessToken } = await this.tokenService.generate({
      clientId: account.id,
      role: account.role,
      sessionId: session.id,
    })

    this.logger.log(`[DEV] accessToken: ${accessToken}`)
    this.logger.log(`[DEV] refreshToken: ${refreshTokenData.refreshToken}`)

    return {
      accessToken,
      refreshToken: refreshTokenData.refreshToken,
    }
  }
}
