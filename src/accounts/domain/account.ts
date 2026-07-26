import { EAccountRole, EAccountStatus, Owner, Renter } from '@pkg/types'

export type RegisterAccountInput = {
  name: string
  lastName: string
  phoneNumber: string
  email: string
  role: EAccountRole
  otpId: string
}

export type RegisterAccountOutput = {
  owner?: Owner
  renter?: Renter
  id: string
  role: EAccountRole
  status: EAccountStatus
  lastLoginAt?: Date
}

export type GetByDestinationInput = {
  phoneNumber?: string
  role?: EAccountRole
  id?: string
}

export type GetAccountInput = {
  id?: string
  phoneNumber?: string
  role?: EAccountRole
}

export type CreateAccountInput = {
  role: EAccountRole
  status: EAccountStatus
}
