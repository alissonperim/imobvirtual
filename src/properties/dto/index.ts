import { EPropertyStatus } from '@pkg/types'

export type CreatePropertyInput = {
  name: string
  description?: string
  baseRentAmount: number
  solarEnergyActive: boolean
  status: EPropertyStatus
  ownerId: string
  addressId?: string
  createdBy?: string
}

export type UpdatePropertyInput = {
  name?: string
  description?: string
  baseRentAmount?: number
  solarEnergyActive?: boolean
  status?: EPropertyStatus
  addressId?: string
  updatedBy?: string
}

export type FindAllPropertiesInput = {
  page?: number
  pageSize?: number
  ownerId?: string
  status?: EPropertyStatus
}
