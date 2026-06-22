import { EAccountRole } from '@pkg/types'

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

export type RefreshTokenInput = {
  refreshToken: string
}

export type RefreshTokenSession = {
  id: string
  accountId: string
  tokenHash: string
  expiresAt: Date
  createdAt: Date
  updatedAt: Date
  revokedAt?: Date
}

export type CreateRefreshTokenSessionInput = {
  id: string
  accountId: string
  tokenHash: string
  expiresAt: Date
}
