import { EAccountRole } from '@pkg/types'
import { IsString } from 'class-validator'

export type AccessToken = {
  role: EAccountRole
  sub: string
  sid: string
  iss: string
  aud: string
  iat: number
  exp: number
}

export type GenerateAccessTokenInput = {
  clientId: string
  role: EAccountRole
  sessionId: string
}

export type TokenPair = {
  accessToken: string
  refreshToken: string
}

export class RefreshTokenInput {
  @IsString()
  refreshToken!: string
}

export type CreateSessionInput = {
  accountId: string
  tokenHash: string
  expiresAt: Date
}

export type SignUpInput = {
  otpId: string
  otp: string
}

export type SignInInput = {
  otpId: string
  otp: string
  customerId: string
}
