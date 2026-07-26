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

export type Session = {
  id: string
  accountId: string
  tokenHash: string
  expiresAt: Date
  createdAt: Date
  updatedAt: Date
  revokedAt: Date | null
}

export type CreateSessionInput = {
  accountId: string
  tokenHash: string
  expiresAt: Date
}

export type SignUpInput = {
  role: EAccountRole
  name: string
  lastName: string
  phoneNumber: string
  email: string
  otpId: string
  otp: string
}

export type SignInInput = {
  role: EAccountRole
  name: string
  lastName: string
  phoneNumber: string
  email: string
  otpId: string
  otp: string
  customerId: string
}
