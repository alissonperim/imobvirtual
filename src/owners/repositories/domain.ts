import { Owner } from '@pkg/types'
import type { Pagination } from '@pkg/utils'
import type {
  CreateOwnerInput,
  FindAllOwnersInput,
  UpdateOwnerInput,
} from '../dto'

export interface IOwnersRepository {
  create(params: CreateOwnerInput): Promise<Owner>
  findAll(filters: FindAllOwnersInput): Promise<Pagination<Owner>>
  findById(id: string): Promise<Owner | null>
  update(id: string, params: UpdateOwnerInput): Promise<Owner | null>
  softDelete(id: string): Promise<boolean>
}
