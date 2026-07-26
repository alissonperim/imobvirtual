import { Address, EMaritalStatus } from '@pkg/types'

export type RegisterOwnerInput = {
  name: string
  lastName: string
  phoneNumber: string
  email: string
}

export type UpdateOwnerInput = {
  name?: string
  lastName?: string
  maritalStatus?: EMaritalStatus
  document?: string
  address?: Omit<Address, 'id'>
  updatedBy: string
}

export type FindAllOwnersInput = {
  page?: number
  pageSize?: number
}

export type CreateOwnerInput = {
  name: string
  lastName: string
  phoneNumber: string
  email: string
  createdBy?: string
}
