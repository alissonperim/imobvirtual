import { Address } from './Address'
import { Base } from './Base'
import { Property } from './Property'

export enum EMaritalStatus {
  MARIED = 'MARIED',
  SINGLE = 'SINGLE',
  DIVORCED = 'DIVORCED',
  WIDOWER = 'WIDOWER',
}

export type Customer = Base & {
  id: string
  name: string
  document: string
  phoneNumber: string
  properties: Property[]
  address: Address
  maritalStatus: EMaritalStatus
  email?: string
}
