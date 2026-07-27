import { Address } from './Address'
import { Base } from './Base'
import { Property } from './Property'

export enum EMaritalStatus {
  MARIED = 'MARIED',
  SINGLE = 'SINGLE',
  DIVORCED = 'DIVORCED',
  WIDOWER = 'WIDOWER',
}

export type Owner = Base & {
  id: string
  name: string
  lastName: string
  document: string
  phoneNumber: string
  properties: Property[]
  address?: Address
  addressId?: string
  maritalStatus: EMaritalStatus
  email?: string
  accountId: string
}
