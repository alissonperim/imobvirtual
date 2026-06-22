import { BadRequestException, Inject, Injectable } from '@nestjs/common'
import { RequestOtpInput, RequestOtpOutput } from '../domain/otp'
import type { IOtpService } from '../services/otp.service'
import type { IOtpChallengesRepository } from '../repositories/otp.domain'
import type { IAccountsRepository } from '@app/accounts/repositories/domain'
import { Account, EOtpChannel } from '@pkg/types'

export interface IRequestOtpUseCase {
  execute(params: RequestOtpInput): Promise<RequestOtpOutput>
}

@Injectable()
export class RequestOtpUseCase implements IRequestOtpUseCase {
  constructor(
    @Inject('ACCOUNTS_REPOSITORY')
    private readonly accountsRepository: IAccountsRepository,

    @Inject('OTP_REPOSITORY')
    private readonly otpRepository: IOtpChallengesRepository,

    @Inject('OTP_SERVICE')
    private readonly otpService: IOtpService,
  ) {}

  async execute(input: RequestOtpInput): Promise<RequestOtpOutput> {
    const destination = this.otpService.normalizeDestination(
      input.destination,
      input.channel,
    )

    const account = await this.getAccountByDestination(
      destination,
      input.channel,
    )

    if (!account) {
      throw new Error('Account not found')
    }

    const otp = this.otpService.generateOtp()

    const otpChallenge = await this.otpRepository.create({
      accountId: account.id,
      destination: input.destination,
      channel: input.channel,
      codeHash: otp.hash,
      expiresAt: new Date(otp.expiresIn),
    })

    // Salvar os dados do otp no banco de dados

    return {
      otpChallengeId: otpChallenge.id,
      expiresIn: otp.expiresIn,
    }
  }

  private async getAccountByDestination(
    destination: string,
    channel: EOtpChannel,
  ): Promise<Account> {
    let getByDestinationParams:
      | {
          email?: string
          phoneNumber?: string
        }
      | undefined = undefined

    if (channel === EOtpChannel.EMAIL) {
      getByDestinationParams = {
        email: destination,
      }
    } else {
      getByDestinationParams = {
        phoneNumber: destination,
      }
    }

    const account = await this.accountsRepository.getByDestination(
      getByDestinationParams,
    )

    if (!account) {
      throw new BadRequestException('Account not found')
    }

    return account
  }
}
