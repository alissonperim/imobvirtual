import type { CreateSessionInput, Session } from '../domain/session'

export interface ISessionsRepository {
  create(params: CreateSessionInput): Promise<Session>
  findActiveByTokenHash(tokenHash: string): Promise<Session | undefined>
  rotate(
    sessionId: string,
    currentTokenHash: string,
    newTokenHash: string,
    newExpiresAt: Date,
  ): Promise<boolean>
  revoke(sessionId: string): Promise<void>
}
