import { Address, EMaritalStatus } from '@pkg/types'

export type CreateOwnerInput = {
  name: string
  lastName: string
  document: string
  phoneNumber: string
  email?: string
  maritalStatus: EMaritalStatus
  accountId: string
  address: Omit<Address, 'id'>
}

export type UpdateOwnerInput = {
  name?: string
  lastName?: string
  maritalStatus?: EMaritalStatus
  address?: Omit<Address, 'id'>
}

export type FindAllOwnersInput = {
  page?: number
  pageSize?: number
}
