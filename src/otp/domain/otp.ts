import { EAccountRole, EOtpChannel, EOtpPurpose } from '@pkg/types'

export type RequestOtpInput = {
  purpose: EOtpPurpose
  channel: EOtpChannel
  phoneNumber: string
  role: EAccountRole
}

export type RequestOtpOutput = {
  otpChallengeId: string
  expiresIn: number
  purpose: EOtpPurpose
}

export type ValidateOtpInput = {
  otp: string
  otpId: string
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

export type GeneratedOtp = {
  hash: string
  code: string
  expiresAt: Date
  expiresInSeconds: number
}

export type CreateOtpOutput = GeneratedOtp & {
  otpId: string
  purpose: EOtpPurpose
}

export type CreateOtpInput = {
  accountId?: string
  destination: string
  channel: EOtpChannel
  purpose: EOtpPurpose
}
