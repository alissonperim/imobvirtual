import { Address, EPropertyStatus } from '@pkg/types'

export type CreatePropertyInput = {
  description: string
  rentAmount: number
  solarEnergyActive: boolean
  status: EPropertyStatus
  ownerId: string
  address: Omit<Address, 'id'>
}

export type UpdatePropertyInput = {
  description?: string
  rentAmount?: number
  solarEnergyActive?: boolean
  status?: EPropertyStatus
  address?: Omit<Address, 'id'>
}

export type FindAllPropertiesInput = {
  page?: number
  pageSize?: number
  ownerId?: string
  status?: EPropertyStatus
}
