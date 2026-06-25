import { EMaritalStatus } from '@pkg/types'

export type CreateOwnerInput = {
  name: string
  document: string
  phoneNumber: string
  email?: string
  maritalStatus: EMaritalStatus
  accountId: string
  addressId: string
  createdBy?: string
}

export type UpdateOwnerInput = {
  name?: string
  phoneNumber?: string
  email?: string
  maritalStatus?: EMaritalStatus
  addressId?: string
  updatedBy?: string
}

export type FindAllOwnersInput = {
  page?: number
  pageSize?: number
}
