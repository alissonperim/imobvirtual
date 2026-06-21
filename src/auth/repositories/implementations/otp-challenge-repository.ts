import { Otp } from '@pkg/types'
import { IOtpChallengesRepository } from '../domain'
import { randomUUID as uuid } from 'node:crypto'
import { OtpCreateRepositoryInput } from '../../domain/otp'

export class OtpChallengesRepository implements IOtpChallengesRepository {
  private readonly activeOtp: Otp[] = []

  async create({
    accountId,
    channel,
    codeHash,
    destination,
    expiresAt,
  }: OtpCreateRepositoryInput): Promise<Otp> {
    const otpChallenge: Otp = {
      id: uuid(),
      accountId,
      destination,
      channel,
      codeHash,
      expiresAt,
      attempts: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: new Date(),
    }

    this.activeOtp.push(otpChallenge)

    return await Promise.resolve(otpChallenge)
  }

  async findActiveByDestination(destination: string): Promise<Otp | undefined> {
    return await Promise.resolve(
      this.activeOtp.find(
        (o) =>
          o.destination === destination && o.expiresAt.getTime() < Date.now(),
      ),
    )
  }

  async consumeActiveByAccountId(accountId: string): Promise<void> {
    await Promise.resolve(() => {
      this.activeOtp.forEach((otp) => {
        const now = new Date()

        if (
          otp.accountId === accountId &&
          otp.expiresAt.getTime() > now.getTime()
        ) {
          if (!otp.consumedAt) {
            otp.consumedAt = now
            otp.updatedAt = now
          }
        }
      })
    })
  }

  findActiveById(id: string): Promise<Otp | undefined> {
    const now = new Date()

    return Promise.resolve(
      this.activeOtp.find(
        (otp) =>
          otp.id === id &&
          !otp.consumedAt &&
          otp.expiresAt.getTime() > now.getTime(),
      ),
    )
  }

  incrementAttempts(id: string): Promise<void> {
    const now = new Date()

    Promise.resolve(
      this.activeOtp.forEach((otp) => {
        if (
          otp.id === id &&
          !otp.consumedAt &&
          otp.attempts < 5 &&
          otp.expiresAt.getTime() > now.getTime()
        ) {
          otp.attempts += 1
        }
      }),
    )

    return Promise.resolve()
  }

  consume(id: string): Promise<void> {
    const otpChallenge = this.activeOtp.find((challenge) => challenge.id === id)

    if (!otpChallenge || otpChallenge.consumedAt) {
      return Promise.resolve()
    }

    const now = new Date()

    otpChallenge.consumedAt = now
    otpChallenge.updatedAt = now

    return Promise.resolve()
  }
}
