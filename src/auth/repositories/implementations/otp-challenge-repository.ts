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
    const otpChallenge = {
      id: uuid(),
      accountId,
      destination,
      channel,
      codeHash,
      expiresAt,
    }

    this.activeOtp.push(otpChallenge as Otp)

    return await Promise.resolve(otpChallenge as Otp)
  }

  async findActiveByDestination(destination: string): Promise<Otp | undefined> {
    return await Promise.resolve(
      this.activeOtp.find(
        (o) =>
          o.destination === destination && o.expiresAt.getTime() < Date.now(),
      ),
    )
  }
}
