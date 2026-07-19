import { Property } from '@pkg/types'
import type { Pagination } from '@pkg/utils'
import type {
  CreatePropertyInput,
  FindAllPropertiesInput,
  UpdatePropertyInput,
} from '../dto'

export type UpdatePropertyRepositoryParams = UpdatePropertyInput & {
  updatedBy: string
}

export type CreatePropertyRepositoryParams = CreatePropertyInput & {
  createdBy: string
}

export interface IPropertiesRepository {
  create(params: CreatePropertyRepositoryParams): Promise<Property>
  findAll(filters: FindAllPropertiesInput): Promise<Pagination<Property>>
  findById(id: string): Promise<Property | null>
  update(
    id: string,
    params: UpdatePropertyRepositoryParams,
  ): Promise<Property | null>
  softDelete(id: string): Promise<boolean>
}
