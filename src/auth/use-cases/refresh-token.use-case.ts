import { Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import { EAccountStatus } from '@pkg/types'
import type { IAccountsRepository } from '@app/accounts/repositories/domain'
import type { RefreshTokenInput, TokenPair } from '../domain/session'
import type { IRefreshTokenSessionsRepository } from '../repositories/session.domain'
import type { ITokenService } from '../services/token.service'

export interface IRefreshTokenUseCase {
  execute(params: RefreshTokenInput): Promise<TokenPair>
}

@Injectable()
export class RefreshTokenUseCase implements IRefreshTokenUseCase {
  constructor(
    @Inject('REFRESH_TOKEN_SESSIONS_REPOSITORY')
    private readonly sessionsRepository: IRefreshTokenSessionsRepository,

    @Inject('ACCESS_TOKEN_SERVICE')
    private readonly tokenService: ITokenService,

    @Inject('ACCOUNTS_REPOSITORY')
    private readonly accountsRepository: IAccountsRepository,
  ) {}

  async execute(params: RefreshTokenInput): Promise<TokenPair> {
    const currentTokenHash = this.tokenService.hashRefreshToken(
      params.refreshToken,
    )
    const session =
      await this.sessionsRepository.findActiveByTokenHash(currentTokenHash)

    if (!session) {
      throw new UnauthorizedException('Invalid refresh token')
    }

    const account = await this.accountsRepository.getById(session.accountId)

    if (!account || account.status !== EAccountStatus.ACTIVE) {
      await this.sessionsRepository.revoke(session.id)
      throw new UnauthorizedException('Account is not active')
    }

    const newRefreshToken = this.tokenService.generateRefreshToken()
    const wasRotated = await this.sessionsRepository.rotate(
      session.id,
      currentTokenHash,
      newRefreshToken.tokenHash,
      newRefreshToken.expiresAt,
    )

    if (!wasRotated) {
      throw new UnauthorizedException('Invalid refresh token')
    }

    const { accessToken } = await this.tokenService.generate({
      clientId: account.id,
      role: account.role,
      sessionId: session.id,
    })

    return {
      accessToken,
      refreshToken: newRefreshToken.refreshToken,
    }
  }
}
