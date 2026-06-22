import type {
  CreateRefreshTokenSessionInput,
  RefreshTokenSession,
} from '../../domain/session'
import type { IRefreshTokenSessionsRepository } from '../session.domain'

export class RefreshTokenSessionsRepository implements IRefreshTokenSessionsRepository {
  private readonly sessions: RefreshTokenSession[] = []

  async create(
    params: CreateRefreshTokenSessionInput,
  ): Promise<RefreshTokenSession> {
    const now = new Date()
    const session: RefreshTokenSession = {
      ...params,
      createdAt: now,
      updatedAt: now,
    }

    this.sessions.push(session)

    return session
  }

  async findActiveByTokenHash(
    tokenHash: string,
  ): Promise<RefreshTokenSession | undefined> {
    const now = Date.now()

    return this.sessions.find(
      (session) =>
        session.tokenHash === tokenHash &&
        !session.revokedAt &&
        session.expiresAt.getTime() > now,
    )
  }

  async rotate(
    sessionId: string,
    currentTokenHash: string,
    newTokenHash: string,
    newExpiresAt: Date,
  ): Promise<boolean> {
    const session = this.sessions.find(
      (candidate) =>
        candidate.id === sessionId &&
        candidate.tokenHash === currentTokenHash &&
        !candidate.revokedAt &&
        candidate.expiresAt.getTime() > Date.now(),
    )

    if (!session) {
      return false
    }

    session.tokenHash = newTokenHash
    session.expiresAt = newExpiresAt
    session.updatedAt = new Date()

    return true
  }

  async revoke(sessionId: string): Promise<void> {
    const session = this.sessions.find(
      (candidate) => candidate.id === sessionId,
    )

    if (!session || session.revokedAt) {
      return
    }

    const now = new Date()
    session.revokedAt = now
    session.updatedAt = now
  }
}
