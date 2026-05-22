import { Base } from './Base'
import { Owner } from './Owner'
import { Property } from './Property'
import { Renter } from './Renter'

export enum ERentalContractStatus {
  ACTIVE = 'ACTIVE',
  FINISHED = 'FINISHED',
  CANCELLED = 'CANCELLED',
}

export type RentalContract = Base & {
  id: string
  owner: Owner
  renter: Renter
  property: Property
  startDate: Date
  endDate?: Date
  rentAmount: number
  dueDay: number
  status: ERentalContractStatus
}
