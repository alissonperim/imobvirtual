import { EAccountRole, EOtpChannel, EOtpPurpose } from '@pkg/types'

export type RequestOtpInput = {
  destination: string
  purpose: EOtpPurpose
  channel: EOtpChannel
}

export type RequestOtpOutput = {
  otpChallengeId: string
  expiresIn: number
  purpose: EOtpPurpose
}

export type VerifySignInOtpInput = {
  otp: string
  otpId: string
}

export type VerifySignUpOtpInput = VerifySignInOtpInput & {
  role: EAccountRole
  name: string
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
