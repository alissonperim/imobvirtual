import { Base } from './Base'

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
  email?: string
  phoneNumber?: string
  role: EAccountRole
  status: EAccountStatus
  lastLoginAt?: Date
}
