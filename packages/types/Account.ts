import { OtpChallengeEntity } from '@app/database/entities'
import { Base } from './Base'
import { Session } from './Session'

export enum EAccountRole {
  OWNER = 'OWNER',
  RENTER = 'RENTER',
}

export enum EAccountStatus {
  ACTIVE = 'ACTIVE',
  BLOCKED = 'BLOCKED',
  PENDING = 'PENDING',
}

export type Account = Base & {
  id: string
  role: EAccountRole
  status: EAccountStatus
  otps?: OtpChallengeEntity[]
  sessions?: Session[]
}
