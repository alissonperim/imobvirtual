import { Base } from './Base'
import { Property } from './Property'

export type Customer = Base & {
  id: string
  name: string
  document: string
  phoneNumber: string
  properties: Property[]
  email?: string
}
