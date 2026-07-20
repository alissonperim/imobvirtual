import { Property } from '@pkg/types'
import type { Pagination } from '@pkg/utils'
import type {
  CreatePropertyInput,
  FindAllPropertiesInput,
  UpdatePropertyInput,
} from '../dto'

export interface IPropertiesRepository {
  create(params: CreatePropertyInput): Promise<Property>
  findAll(filters: FindAllPropertiesInput): Promise<Pagination<Property>>
  findById(id: string): Promise<Property | null>
  update(id: string, params: UpdatePropertyInput): Promise<Property | null>
  softDelete(id: string): Promise<boolean>
}
