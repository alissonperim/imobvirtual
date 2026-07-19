import { Address } from './Address'
import { Base } from './Base'
import { Owner } from './Owner'

export enum EPropertyStatus {
  AVAILABLE = 'AVAILABLE',
  RENTED = 'RENTED',
  MAINTENANCE = 'MAINTENANCE',
}

export type Property = Base & {
  id: string
  description?: string
  address?: Address
  addressId?: string | null
  rentAmount: number
  solarEnergyActive: boolean
  status: EPropertyStatus
  owner: Omit<Owner, 'address'>
}
