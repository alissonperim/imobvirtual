import { Address } from './Address'
import { Base } from './Base'
import { EMaritalStatus } from './Owner'
import { RentalContract } from './RentalContract'

export type Renter = Base & {
  id: string
  name: string
  lastName: string
  document: string
  phoneNumber: string
  email: string
  address?: Address
  maritalStatus?: EMaritalStatus
  rentalContracts?: RentalContract[]
  accountId: string
}
