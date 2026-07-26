import { CreateRenterRepositoryInput } from '../domain'
import { RenterEntity } from '@app/database/entities'

export interface IRenterRepository {
  create(params: CreateRenterRepositoryInput): Promise<RenterEntity>
}
