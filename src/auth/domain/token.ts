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
}
