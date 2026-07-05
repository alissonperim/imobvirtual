import { Injectable } from '@nestjs/common'
import type { ISessionsRepository } from '../session.domain'
import type { CreateSessionInput, Session } from '../../domain/session'
import { PrismaService } from '@app/prisma/prisma.service'

@Injectable()
export class SessionsRepository implements ISessionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(params: CreateSessionInput): Promise<Session> {
    const row = await this.prisma.session.create({
      data: {
        account_id: params.accountId,
        token_hash: params.tokenHash,
        expires_at: params.expiresAt,
      },
    })
    return this.toSession(row)
  }

  async findActiveByTokenHash(tokenHash: string): Promise<Session | undefined> {
    const row = await this.prisma.session.findFirst({
      where: {
        token_hash: tokenHash,
        revoked_at: null,
        expires_at: { gt: new Date() },
      },
    })
    return row ? this.toSession(row) : undefined
  }

  async rotate(
    sessionId: string,
    currentTokenHash: string,
    newTokenHash: string,
    newExpiresAt: Date,
  ): Promise<boolean> {
    const result = await this.prisma.session.updateMany({
      where: {
        id: sessionId,
        token_hash: currentTokenHash,
        revoked_at: null,
        expires_at: { gt: new Date() },
      },
      data: { token_hash: newTokenHash, expires_at: newExpiresAt },
    })
    return result.count > 0
  }

  async revoke(sessionId: string): Promise<void> {
    await this.prisma.session.update({
      where: { id: sessionId },
      data: { revoked_at: new Date() },
    })
  }

  private toSession(row: {
    id: string
    account_id: string
    token_hash: string
    expires_at: Date
    revoked_at: Date | null
    created_at: Date
    updated_at: Date
  }): Session {
    return {
      id: row.id,
      accountId: row.account_id,
      tokenHash: row.token_hash,
      expiresAt: row.expires_at,
      revokedAt: row.revoked_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }
  }
}
