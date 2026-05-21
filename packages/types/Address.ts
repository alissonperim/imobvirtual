import { Base } from './Base'

export type Address = Base & {
  id: string
  street: string
  neighborhood: string
  postalCode: string
  complement: string
  city: string
  state: string
  number: string
}
