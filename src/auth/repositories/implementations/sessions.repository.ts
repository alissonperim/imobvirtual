import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { IsNull, MoreThan, Repository } from 'typeorm'
import type { ISessionsRepository } from '../session.domain'
import type { CreateSessionInput } from '../../domain/session'
import { AccountEntity, SessionEntity } from '@app/database/entities'
import { wasAffected } from '@pkg/utils/error-utils'
import { ESessionStatus, Session } from '@pkg/types'

@Injectable()
export class SessionsRepository implements ISessionsRepository {
  constructor(
    @InjectRepository(SessionEntity)
    private readonly repository: Repository<SessionEntity>,
  ) {}

  async create(params: CreateSessionInput): Promise<Session> {
    const entity = this.repository.create({
      account: { id: params.accountId } as AccountEntity,
      tokenHash: params.tokenHash,
      expiresAt: params.expiresAt,
      status: ESessionStatus.ACTIVE,
    })
    const saved = await this.repository.save(entity)
    saved.accountId = params.accountId
    return this.toSession(saved)
  }

  async findActiveByTokenHash(tokenHash: string): Promise<Session | undefined> {
    const row = await this.repository.findOne({
      where: {
        tokenHash,
        revokedAt: IsNull(),
        expiresAt: MoreThan(new Date()),
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
    const result = await this.repository.update(
      {
        id: sessionId,
        tokenHash: currentTokenHash,
        revokedAt: IsNull(),
        expiresAt: MoreThan(new Date()),
      },
      { tokenHash: newTokenHash, expiresAt: newExpiresAt },
    )
    return wasAffected(result)
  }

  async revoke(sessionId: string): Promise<void> {
    await this.repository.update({ id: sessionId }, { revokedAt: new Date() })
  }

  private toSession(row: SessionEntity): Session {
    return {
      id: row.id,
      accountId: row.accountId,
      account: row.account,
      status: row.status,
      tokenHash: row.tokenHash,
      expiresAt: row.expiresAt,
      revokedAt: row.revokedAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }
  }
}
