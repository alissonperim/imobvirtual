import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common'
import { RequestOtpInput, RequestOtpOutput } from '../domain/otp'
import type { IOtpService } from '../services/otp.service'
import type { IOtpChallengesRepository } from '../repositories/otp.domain'
import type { IAccountsRepository } from '@app/accounts/repositories/domain'
import { EOtpPurpose } from '@pkg/types'

export interface IRequestOtpUseCase {
  execute(params: RequestOtpInput): Promise<RequestOtpOutput>
}

@Injectable()
export class RequestOtpUseCase implements IRequestOtpUseCase {
  private readonly logger = new Logger(RequestOtpUseCase.name)

  constructor(
    @Inject('ACCOUNTS_REPOSITORY')
    private readonly accountsRepository: IAccountsRepository,

    @Inject('OTP_REPOSITORY')
    private readonly otpRepository: IOtpChallengesRepository,

    @Inject('OTP_SERVICE')
    private readonly otpService: IOtpService,
  ) {}

  async execute(input: RequestOtpInput): Promise<RequestOtpOutput> {
    const destination = this.otpService.normalizeDestination(input.destination)

    const account = await this.accountsRepository.getByDestination({
      phoneNumber: destination,
    })

    if (!account && input.purpose === EOtpPurpose.SIGN_IN) {
      throw new BadRequestException('Account not found')
    }

    if (account && input.purpose === EOtpPurpose.SIGN_UP) {
      throw new ConflictException('Account already exists')
    }

    const otp = this.otpService.generateOtp()
    this.logger.log(`[DEV] OTP code: ${otp.code}`)

    const otpChallenge = await this.otpRepository.create({
      accountId: account ? account.id : undefined,
      destination,
      channel: input.channel,
      codeHash: otp.hash,
      expiresAt: otp.expiresAt,
      purpose: input.purpose,
    })

    return {
      otpChallengeId: otpChallenge.id,
      expiresIn: otp.expiresInSeconds,
      purpose: otpChallenge.purpose,
    }
  }
}
