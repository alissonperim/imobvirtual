import { EAccountRole, EOtpChannel, EOtpPurpose } from '@pkg/types'
import { IsEnum, IsString } from 'class-validator'

export class RequestOtpInput {
  @IsString()
  destination!: string

  @IsEnum(EOtpPurpose)
  purpose!: EOtpPurpose

  @IsEnum(EOtpChannel)
  channel!: EOtpChannel
}

export type RequestOtpOutput = {
  otpChallengeId: string
  expiresIn: number
  purpose: EOtpPurpose
}

export class VerifySignInOtpInput {
  @IsString()
  otp!: string

  @IsString()
  otpId!: string
}

export class VerifySignUpOtpInput extends VerifySignInOtpInput {
  @IsEnum(EAccountRole)
  role!: EAccountRole

  @IsString()
  name!: string
}

export type VerifyOtpOutput = {
  accessToken: string
  refreshToken: string
}

export type OtpCreateRepositoryInput = {
  accountId?: string
  destination: string
  channel: EOtpChannel
  codeHash: string
  expiresAt: Date
  purpose: EOtpPurpose
}
