import { EOtpChannel } from '@pkg/types'

export type RequestOtpInput = {
  destination: string
  channel: EOtpChannel
}

export type RequestOtpOutput = {
  optChallangeId: string
  expiresInSeconds: number
}

export type VerifyOtpInput = {
  otpChallengeId: string
  code: string
}

export type VerifyOtpOutput = {
  accessToken: string
}
