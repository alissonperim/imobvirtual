import { Injectable } from '@nestjs/common'
import { Otp, EOtpChannel, EOtpPurpose } from '@pkg/types'
import { PrismaService } from '@app/prisma/prisma.service'
import type { IOtpChallengesRepository } from '../otp.domain'
import type { OtpCreateRepositoryInput } from '../../domain/otp'

@Injectable()
export class OtpChallengesRepository implements IOtpChallengesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(params: OtpCreateRepositoryInput): Promise<Otp> {
    const row = await this.prisma.otpChallenge.create({
      data: {
        account_id: params.accountId,
        destination: params.destination,
        channel: params.channel,
        code_hash: params.codeHash,
        expires_at: params.expiresAt,
        purpose: params.purpose,
      },
    })
    return this.toOtp(row)
  }

  async findActiveById(id: string): Promise<Otp | undefined> {
    const row = await this.prisma.otpChallenge.findFirst({
      where: { id, expires_at: { gt: new Date() }, consumed_at: null },
    })
    return row ? this.toOtp(row) : undefined
  }

  async incrementAttempts(id: string): Promise<void> {
    await this.prisma.otpChallenge.update({
      where: { id },
      data: { attempts: { increment: 1 } },
    })
  }

  async consume(id: string): Promise<void> {
    await this.prisma.otpChallenge.update({
      where: { id },
      data: { consumed_at: new Date() },
    })
  }

  async consumeActiveByAccountId(accountId: string): Promise<void> {
    await this.prisma.otpChallenge.updateMany({
      where: {
        account_id: accountId,
        consumed_at: null,
        expires_at: { gt: new Date() },
      },
      data: { consumed_at: new Date() },
    })
  }

  private toOtp(row: {
    id: string
    destination: string
    purpose: string
    channel: string
    account_id: string | null
    code_hash: string
    expires_at: Date
    attempts: number
    consumed_at: Date | null
    created_at: Date
    updated_at: Date
  }): Otp {
    return {
      id: row.id,
      destination: row.destination,
      purpose: row.purpose as EOtpPurpose,
      channel: row.channel as EOtpChannel,
      accountId: row.account_id ?? undefined,
      codeHash: row.code_hash,
      expiresAt: row.expires_at,
      attempts: row.attempts,
      consumedAt: row.consumed_at ?? undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }
  }
}
