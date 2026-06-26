import { Inject, Injectable, Logger, UnauthorizedException } from '@nestjs/common'
import type { IOtpChallengesRepository } from '../repositories/otp.domain'
import type { IOtpService } from '../services/otp.service'
import type { ITokenService } from '../services/token.service'
import type { IAccountsRepository } from '@app/accounts/repositories/domain'
import type { VerifySignInOtpInput } from '../domain/otp'
import type { IRefreshTokenSessionsRepository } from '../repositories/session.domain'
import { randomUUID } from 'node:crypto'
import { EOtpPurpose } from '@pkg/types'

export interface IVerifySignInOtpUseCase {
  execute(
    params: VerifySignInOtpInput,
  ): Promise<{ accessToken: string; refreshToken: string }>
}

@Injectable()
export class VerifySignInOtpUseCase implements IVerifySignInOtpUseCase {
  private readonly logger = new Logger(VerifySignInOtpUseCase.name)

  constructor(
    @Inject('OTP_REPOSITORY')
    private readonly repository: IOtpChallengesRepository,

    @Inject('OTP_SERVICE')
    private readonly service: IOtpService,

    @Inject('ACCESS_TOKEN_SERVICE')
    private readonly tokenService: ITokenService,

    @Inject('ACCOUNTS_REPOSITORY')
    private readonly accountsRepository: IAccountsRepository,

    @Inject('REFRESH_TOKEN_SESSIONS_REPOSITORY')
    private readonly refreshTokenSessionsRepository: IRefreshTokenSessionsRepository,
  ) {}

  async execute(
    params: VerifySignInOtpInput,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const challengOtp = await this.repository.findActiveById(params.otpId)

    if (!challengOtp) {
      throw new UnauthorizedException('Invalid OTP')
    }

    if (challengOtp.purpose !== EOtpPurpose.SIGN_IN || !challengOtp.accountId) {
      throw new UnauthorizedException('Invalid OTP')
    }

    if (challengOtp.attempts >= 3) {
      await this.repository.consume(challengOtp.id)
      throw new UnauthorizedException('Invalid OTP')
    }

    const isOtpValid = this.service.validateOtp(
      params.otp,
      challengOtp.codeHash,
    )

    if (!isOtpValid) {
      await this.repository.incrementAttempts(challengOtp.id)
      throw new UnauthorizedException('Invalid OTP')
    }

    await this.repository.consume(challengOtp.id)
    const account = await this.accountsRepository.getById(challengOtp.accountId)

    if (!account) {
      throw new UnauthorizedException('Account not found')
    }

    const sessionId = randomUUID()
    const refreshTokenData = this.tokenService.generateRefreshToken()

    await this.refreshTokenSessionsRepository.create({
      id: sessionId,
      accountId: account.id,
      tokenHash: refreshTokenData.tokenHash,
      expiresAt: refreshTokenData.expiresAt,
    })

    const { accessToken } = await this.tokenService.generate({
      clientId: account.id,
      role: account.role,
      sessionId,
    })

    this.logger.log(`[DEV] accessToken: ${accessToken}`)
    this.logger.log(`[DEV] refreshToken: ${refreshTokenData.refreshToken}`)

    return {
      accessToken,
      refreshToken: refreshTokenData.refreshToken,
    }
  }
}
