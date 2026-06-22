import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import type { IOtpChallengesRepository } from '../repositories/otp.domain'
import type { IOtpService } from '../services/otp.service'
import type { ITokenService } from '../services/token.service'
import type { IAccountsRepository } from '@app/accounts/repositories/domain'
import type { VerifySignUpOtpInput } from '../domain/otp'
import type { IRefreshTokenSessionsRepository } from '../repositories/session.domain'
import { randomUUID } from 'node:crypto'
import { EAccountStatus, EOtpPurpose } from '@pkg/types'

export interface IVerifySignUpOtpUseCase {
  execute(
    params: VerifySignUpOtpInput,
  ): Promise<{ accessToken: string; refreshToken: string }>
}

@Injectable()
export class VerifySignUpOtpUseCase implements IVerifySignUpOtpUseCase {
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
    params: VerifySignUpOtpInput,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const challengOtp = await this.repository.findActiveById(params.otpId)

    if (!challengOtp) {
      throw new UnauthorizedException('Invalid OTP')
    }

    if (challengOtp.purpose !== EOtpPurpose.SIGN_UP || challengOtp.accountId) {
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
    const account = await this.accountsRepository.create({
      role: params.role,
      status: EAccountStatus.ACTIVE,
      phoneNumber: challengOtp.destination,
      name: params.name,
    })

    if (!account) {
      throw new BadRequestException('Failed to create account')
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

    return {
      accessToken,
      refreshToken: refreshTokenData.refreshToken,
    }
  }
}
