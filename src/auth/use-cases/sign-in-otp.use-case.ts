import { Inject, Injectable, Logger } from '@nestjs/common'
import type { ITokenService } from '../services/token.service'
import type { ISessionsRepository } from '../repositories/session.domain'
import { SignInInput } from '../domain/session'
import type { IOtpService } from '@app/otp/services/otp.service'
import type { IAccountService } from '@app/accounts/services/register.service'
import { EOtpPurpose } from '@pkg/types'

export interface ISignInOtpConsumeUseCase {
  execute(
    params: SignInInput,
  ): Promise<{ accessToken: string; refreshToken: string }>
}

@Injectable()
export class SignInOtpConsumeUseCase implements ISignInOtpConsumeUseCase {
  private readonly logger = new Logger(SignInOtpConsumeUseCase.name)

  constructor(
    @Inject('OTP_SERVICE')
    private readonly otpService: IOtpService,

    @Inject('ACCESS_TOKEN_SERVICE')
    private readonly tokenService: ITokenService,

    @Inject('ACCOUNTS_SERVICE')
    private readonly accountService: IAccountService,

    @Inject('REFRESH_TOKEN_SESSIONS_REPOSITORY')
    private readonly SessionsRepository: ISessionsRepository,
  ) {}

  async execute(
    params: SignInInput,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const otp = await this.otpService.getAndValidate({
      otp: params.otp,
      otpId: params.otpId,
      purpose: EOtpPurpose.SIGN_IN,
    })

    const account = await this.accountService.getAccount({ id: otp.accountId })
    const refreshTokenData = this.tokenService.generateRefreshToken()

    const session = await this.SessionsRepository.create({
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
