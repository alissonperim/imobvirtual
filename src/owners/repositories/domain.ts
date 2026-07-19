import { Owner } from '@pkg/types'
import type { Pagination } from '@pkg/utils'
import type {
  CreateOwnerInput,
  FindAllOwnersInput,
  UpdateOwnerInput,
} from '../dto'

export type CreateOwnerRepositoryInput = CreateOwnerInput & {
  createdBy: string
}

export type UpdateOwnerRepositoryInput = UpdateOwnerInput & {
  updatedBy: string
}

export interface IOwnersRepository {
  create(params: CreateOwnerRepositoryInput): Promise<Owner>
  findAll(filters: FindAllOwnersInput): Promise<Pagination<Owner>>
  findById(id: string): Promise<Owner | null>
  update(id: string, params: UpdateOwnerRepositoryInput): Promise<Owner | null>
  softDelete(id: string): Promise<boolean>
}
