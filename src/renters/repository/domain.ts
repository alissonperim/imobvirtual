import { Renter } from '@pkg/types'
import { CreateRenterRepositoryInput } from '../domain'

export interface IRenterRepository {
  create(params: CreateRenterRepositoryInput): Promise<Renter>
}
