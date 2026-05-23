import { Injectable } from '@nestjs/common'
import { RequestOtpInput, RequestOtpOutput } from '../domain/otp'
import { generateOtpCode } from '../services/otp-code-generator'
import crypto from 'node:crypto'

export interface IRequestOptUseCase {
  execute(params: RequestOtpInput): Promise<RequestOtpOutput>
}

@Injectable()
export class RequestOtpUseCase implements IRequestOptUseCase {
  constructor(
    private readonly accountsRepository: AccountsRepository,
    private readonly otpChallengesRepository: OtpChallengesRepository,
    private readonly otpSender: OtpSender,
  ) {}

  async execute(input: RequestOtpInput): Promise<RequestOtpOutput> {
    const destination = normalizeDestination(input.destination)

    const account =
      await this.accountsRepository.findActiveByDestination(destination)

    if (!account) {
      throw new Error('Account not found')
    }

    await this.otpChallengesRepository.consumeActiveByAccountId(account.id)

    const code = generateOtpCode()
    const codeHash = crypto.createHash('sha256').update(code).digest('base64')

    const otpChallenge = {
      id: crypto.randomUUID(),
      accountId: account.id,
      destination,
      channel: input.channel,
      codeHash,
      attempts: 0,
      maxAttempts: 5,
      expiresAt: addMinutes(new Date(), 5),
      consumedAt: null,
      createdAt: new Date(),
    }

    await this.otpChallengesRepository.create(otpChallenge)

    await this.otpSender.send({
      destination,
      channel: input.channel,
      code,
    })

    return {
      otpChallengeId: otpChallenge.id,
      expiresInSeconds: 300,
    }
  }
}
