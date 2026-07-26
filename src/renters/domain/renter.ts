import { EMaritalStatus } from '@pkg/types'

export type RenterRegisterInput = {
  name: string
  lastName: string
  phoneNumber: string
  email: string
}

export type CreateRenterRepositoryInput = {
  name: string
  lastName: string
  phoneNumber: string
  email: string
}

export type AddressDto = {
  id: string
  street: string
  neighborhood: string
  postalCode: string
  complement: string
  city: string
  state: string
  number: string
}

export type RenterDto = {
  id: string
  name: string
  lastName: string
  document: string
  email: string
  address?: AddressDto
  maritalStatus?: EMaritalStatus
  phoneNumber?: string
  accountId: string
}
