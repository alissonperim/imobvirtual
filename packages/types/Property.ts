import { Address } from './Address'
import { Base } from './Base'

export enum PropertyStatus {
  AVAILABLE = 'AVAILABLE',
  RENTED = 'RENTED',
  MAINTENANCE = 'MAINTENANCE',
}

export type Property = Base & {
  id: string
  name: string
  description?: string
  address?: Address
  baseRentAmount: number
  solarEnergyActive: boolean
  status: PropertyStatus
}
