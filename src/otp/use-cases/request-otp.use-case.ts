import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common'
import { RequestOtpInput, RequestOtpOutput } from '../../otp/domain/otp'
import { EOtpPurpose } from '@pkg/types'
import type { IOtpService } from '../services/otp.service'
import type { IAccountService } from '@app/accounts/services/register.service'

export interface IRequestOtpUseCase {
  execute(params: RequestOtpInput): Promise<RequestOtpOutput>
}

@Injectable()
export class RequestOtpUseCase implements IRequestOtpUseCase {
  private readonly logger = new Logger(RequestOtpUseCase.name)

  constructor(
    @Inject('OTP_SERVICE')
    private readonly otpService: IOtpService,

    @Inject('ACCOUNT_SERVICE')
    private readonly accountService: IAccountService,
  ) {}

  async execute(input: RequestOtpInput): Promise<RequestOtpOutput> {
    const destination = input.phoneNumber

    const account = await this.accountService.getAccount({
      phoneNumber: destination,
      role: input.role,
    })

    if (!account && input.purpose === EOtpPurpose.SIGN_IN) {
      throw new BadRequestException('Account not found')
    }

    if (account && input.purpose === EOtpPurpose.SIGN_UP) {
      throw new ConflictException('Account already exists')
    }

    const otp = await this.otpService.createOtp({
      channel: input.channel,
      destination: input.phoneNumber,
      purpose: input.purpose,
      accountId: account?.id,
    })

    this.logger.log(`[DEV] OTP code: ${otp.code}`)

    return {
      otpChallengeId: otp.otpId,
      expiresIn: otp.expiresInSeconds,
      purpose: otp.purpose,
    }
  }
}
