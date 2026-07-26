import { Account } from './Account'
import { Base } from './Base'

export enum ESessionStatus {
  ACTIVE = 'ACITVE',
  SUSPENDED = 'SUSPENDED',
  FINISHED = 'FINISHED',
}

export type Session = Base & {
  id: string
  tokenHash: string
  userAgent?: string
  ipAddress?: string
  lastLoggedAt?: Date
  deviceId?: string
  expiresAt: Date
  revokedAt?: Date
  account: Account
  accountId?: string
  status: ESessionStatus
}
