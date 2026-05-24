import { Injectable } from '@nestjs/common'
import { RequestOtpInput, RequestOtpOutput } from '../domain/otp'
import crypto from 'node:crypto'
import { OtpService } from '../services/otp-service'
import { IOtpChallengesRepository } from '../repositories/domain'

export interface IRequestOptUseCase {
  execute(params: RequestOtpInput): Promise<RequestOtpOutput>
}

@Injectable()
export class RequestOtpUseCase implements IRequestOptUseCase {
  constructor(
    private readonly accountsRepository: AccountsRepository,
    private readonly otpRepository: IOtpChallengesRepository,
  ) {}

  async execute(input: RequestOtpInput): Promise<RequestOtpOutput> {
    const destination = OtpService.normalizeDestination(
      input.destination,
      input.channel,
    )

    const account =
      await this.accountsRepository.findActiveByDestination(destination)

    if (!account) {
      throw new Error('Account not found')
    }

    await this.otpRepository.consumeActiveByAccountId(account.id)

    const code = OtpService.generateCode()
    const codeHash = crypto.createHash('sha256').update(code).digest('base64')

    return {
      otpChallengeId: otpChallenge.id,
      expiresInSeconds: 300,
    }
  }
}
