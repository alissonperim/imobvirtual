import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { IsNull, MoreThan, Repository } from 'typeorm'
import { Otp } from '@pkg/types'
import { AccountEntity, OtpChallengeEntity } from '@app/database/entities'
import type { IOtpChallengesRepository } from '../otp.domain'
import type { OtpCreateRepositoryInput } from '../../domain/otp'

@Injectable()
export class OtpChallengesRepository implements IOtpChallengesRepository {
  constructor(
    @InjectRepository(OtpChallengeEntity)
    private readonly repository: Repository<OtpChallengeEntity>,
  ) {}

  async create(params: OtpCreateRepositoryInput): Promise<Otp> {
    const entity = this.repository.create({
      account: params.accountId ? { id: params.accountId } : null,
      destination: params.destination,
      channel: params.channel,
      codeHash: params.codeHash,
      expiresAt: params.expiresAt,
      purpose: params.purpose,
    })
    const saved = await this.repository.save(entity)
    saved.accountId = params.accountId ?? null
    return this.toOtp(saved)
  }

  async findActiveById(id: string): Promise<Otp | undefined> {
    const row = await this.repository.findOne({
      where: { id, expiresAt: MoreThan(new Date()), consumedAt: IsNull() },
    })
    return row ? this.toOtp(row) : undefined
  }

  async incrementAttempts(id: string): Promise<void> {
    await this.repository.increment({ id }, 'attempts', 1)
  }

  async consume(id: string): Promise<void> {
    await this.repository.update({ id }, { consumedAt: new Date() })
  }

  async consumeActiveByAccountId(accountId: string): Promise<void> {
    await this.repository.update(
      {
        account: { id: accountId } as AccountEntity,
        consumedAt: IsNull(),
        expiresAt: MoreThan(new Date()),
      },
      { consumedAt: new Date() },
    )
  }

  private toOtp(row: OtpChallengeEntity): Otp {
    return {
      id: row.id,
      destination: row.destination,
      purpose: row.purpose,
      channel: row.channel,
      accountId: row.accountId ?? undefined,
      codeHash: row.codeHash,
      expiresAt: row.expiresAt,
      attempts: row.attempts,
      consumedAt: row.consumedAt ?? undefined,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }
  }
}
