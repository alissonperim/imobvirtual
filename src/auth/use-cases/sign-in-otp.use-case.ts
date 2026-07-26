import { Inject, Injectable, Logger } from '@nestjs/common'
import type { ITokenService } from '../services/token.service'
import type { ISessionsRepository } from '../repositories/session.domain'
import { SignInInput } from '../domain/session'
import type { IOtpService } from '@app/otp/services/otp.service'
import type { IAccountService } from '@app/accounts/services/register.service'

export interface IVerifySignInOtpUseCase {
  execute(
    params: SignInInput,
  ): Promise<{ accessToken: string; refreshToken: string }>
}

@Injectable()
export class SignInOtpUseCase implements IVerifySignInOtpUseCase {
  private readonly logger = new Logger(SignInOtpUseCase.name)

  constructor(
    @Inject('OTP_SERVICE')
    private readonly otpService: IOtpService,

    @Inject('ACCESS_TOKEN_SERVICE')
    private readonly tokenService: ITokenService,

    @Inject('ACCOUNT_SERVICE')
    private readonly accountService: IAccountService,

    @Inject('REFRESH_TOKEN_SESSIONS_REPOSITORY')
    private readonly SessionsRepository: ISessionsRepository,
  ) {}

  async execute(
    params: SignInInput,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    await this.otpService.validate({
      otp: params.otp,
      otpId: params.otpId,
    })

    const refreshTokenData = this.tokenService.generateRefreshToken()
    const account = await this.accountService.getAccount({
      role: params.role,
      phoneNumber: params.phoneNumber,
    })

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
