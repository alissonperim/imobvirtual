import type {
  CreateRefreshTokenSessionInput,
  RefreshTokenSession,
} from '../domain/session'

export interface IRefreshTokenSessionsRepository {
  create(params: CreateRefreshTokenSessionInput): Promise<RefreshTokenSession>
  findActiveByTokenHash(
    tokenHash: string,
  ): Promise<RefreshTokenSession | undefined>
  rotate(
    sessionId: string,
    currentTokenHash: string,
    newTokenHash: string,
    newExpiresAt: Date,
  ): Promise<boolean>
  revoke(sessionId: string): Promise<void>
}
