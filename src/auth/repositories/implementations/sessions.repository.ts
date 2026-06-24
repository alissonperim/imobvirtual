import { Injectable } from '@nestjs/common'
import { PrismaService } from '@app/prisma/prisma.service'
import type { IRefreshTokenSessionsRepository } from '../session.domain'
import type {
  CreateRefreshTokenSessionInput,
  RefreshTokenSession,
} from '../../domain/session'

@Injectable()
export class RefreshTokenSessionsRepository implements IRefreshTokenSessionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    params: CreateRefreshTokenSessionInput,
  ): Promise<RefreshTokenSession> {
    const row = await this.prisma.refreshTokenSession.create({
      data: {
        id: params.id,
        accountId: params.accountId,
        tokenHash: params.tokenHash,
        expiresAt: params.expiresAt,
      },
    })
    return this.toSession(row)
  }

  async findActiveByTokenHash(
    tokenHash: string,
  ): Promise<RefreshTokenSession | undefined> {
    const row = await this.prisma.refreshTokenSession.findFirst({
      where: { tokenHash, revokedAt: null, expiresAt: { gt: new Date() } },
    })
    return row ? this.toSession(row) : undefined
  }

  async rotate(
    sessionId: string,
    currentTokenHash: string,
    newTokenHash: string,
    newExpiresAt: Date,
  ): Promise<boolean> {
    const result = await this.prisma.refreshTokenSession.updateMany({
      where: {
        id: sessionId,
        tokenHash: currentTokenHash,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      data: { tokenHash: newTokenHash, expiresAt: newExpiresAt },
    })
    return result.count > 0
  }

  async revoke(sessionId: string): Promise<void> {
    await this.prisma.refreshTokenSession.update({
      where: { id: sessionId },
      data: { revokedAt: new Date() },
    })
  }

  private toSession(row: {
    id: string
    accountId: string
    tokenHash: string
    expiresAt: Date
    revokedAt: Date | null
    createdAt: Date
    updatedAt: Date
  }): RefreshTokenSession {
    return {
      id: row.id,
      accountId: row.accountId,
      tokenHash: row.tokenHash,
      expiresAt: row.expiresAt,
      revokedAt: row.revokedAt ?? undefined,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }
  }
}
