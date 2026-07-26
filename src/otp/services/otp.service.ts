import { Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import {
  CreateOtpInput,
  CreateOtpOutput,
  GeneratedOtp,
  ValidateOtpInput,
} from '../domain'
import { EOtpPurpose } from '@pkg/types'
import crypto from 'node:crypto'
import type { IOtpRepository } from '../repository/otp.domain'

export interface IOtpService {
  validate(params: ValidateOtpInput): Promise<void>
  createOtp(params: CreateOtpInput): Promise<CreateOtpOutput>
}

@Injectable()
export class OtpService implements IOtpService {
  private configuredExpirationMinutes = Number(
    process.env.MINUTES_TO_EXPIRE_OTP,
  )
  private expirationMinutes =
    Number.isFinite(this.configuredExpirationMinutes) &&
    this.configuredExpirationMinutes > 0
      ? this.configuredExpirationMinutes
      : 6

  constructor(
    @Inject('OTP_REPOSITORY')
    private readonly repository: IOtpRepository,
  ) {}

  async validate(params: ValidateOtpInput): Promise<void> {
    const challengOtp = await this.repository.findActiveById(params.otpId)

    if (!challengOtp) {
      throw new UnauthorizedException('Invalid OTP')
    }

    if (challengOtp.purpose !== EOtpPurpose.SIGN_UP || challengOtp.accountId) {
      throw new UnauthorizedException('Invalid OTP')
    }

    if (challengOtp.attempts >= 3) {
      await this.repository.consume(challengOtp.id)
      throw new UnauthorizedException('Invalid OTP')
    }

    const isOtpValid = this.validateOtp(params.otp, challengOtp.codeHash)

    if (!isOtpValid) {
      await this.repository.incrementAttempts(challengOtp.id)
      throw new UnauthorizedException('Invalid OTP')
    }

    await this.repository.consume(challengOtp.id)

    return
  }

  async createOtp({
    accountId,
    destination,
    channel,
    purpose,
  }: CreateOtpInput): Promise<CreateOtpOutput> {
    const otp = this.generateOtp()

    const otpCreated = await this.repository.create({
      accountId,
      destination,
      channel,
      codeHash: otp.hash,
      expiresAt: otp.expiresAt,
      purpose,
    })

    return {
      code: otp.code,
      expiresAt: otp.expiresAt,
      expiresInSeconds: otp.expiresInSeconds,
      hash: otp.hash,
      otpId: otpCreated.id,
      purpose: otpCreated.purpose,
    }
  }

  private generateOtp(): GeneratedOtp {
    const nums: number[] = []

    for (let i = 0; i < 6; i++) {
      const num = crypto.randomInt(0, 10)
      nums.push(num)
    }

    const code = nums.join('')
    const hash = this.hashCode(code)
    const expiresInSeconds = this.expirationMinutes * 60

    return {
      code,
      hash,
      expiresAt: new Date(Date.now() + expiresInSeconds * 1000),
      expiresInSeconds,
    }
  }

  private validateOtp(otpReceived: string, challengOtpHash: string): boolean {
    const hash = this.hashCode(otpReceived)

    return challengOtpHash === hash
  }

  private hashCode(code: string): string {
    return crypto.createHash('sha256').update(code).digest('base64')
  }
}
