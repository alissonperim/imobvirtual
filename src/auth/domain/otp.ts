import { EOtpChannel } from '@pkg/types'

export type RequestOtpInput = {
  destination: string
  channel: EOtpChannel
}

export type RequestOtpOutput = {
  otpChallengeId: string
  expiresIn: number
}

export type VerifyOtpInput = {
  otpChallengeId: string
  code: string
}

export type VerifyOtpOutput = {
  accessToken: string
}

export type OtpCreateRepositoryInput = {
  accountId: string
  destination: string
  channel: EOtpChannel
  codeHash: string
  expiresAt: Date
}
