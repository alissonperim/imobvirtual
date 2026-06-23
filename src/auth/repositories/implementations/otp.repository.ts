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
        accountId: params.accountId,
        destination: params.destination,
        channel: params.channel,
        codeHash: params.codeHash,
        expiresAt: params.expiresAt,
        purpose: params.purpose,
      },
    })
    return this.toOtp(row)
  }

  async findActiveById(id: string): Promise<Otp | undefined> {
    const row = await this.prisma.otpChallenge.findFirst({
      where: { id, expiresAt: { gt: new Date() }, consumedAt: null },
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
      data: { consumedAt: new Date() },
    })
  }

  async consumeActiveByAccountId(accountId: string): Promise<void> {
    await this.prisma.otpChallenge.updateMany({
      where: { accountId, consumedAt: null, expiresAt: { gt: new Date() } },
      data: { consumedAt: new Date() },
    })
  }

  private toOtp(row: {
    id: string
    destination: string
    purpose: string
    channel: string
    accountId: string | null
    codeHash: string
    expiresAt: Date
    attempts: number
    consumedAt: Date | null
    createdAt: Date
    updatedAt: Date
  }): Otp {
    return {
      id: row.id,
      destination: row.destination,
      purpose: row.purpose as EOtpPurpose,
      channel: row.channel as EOtpChannel,
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
