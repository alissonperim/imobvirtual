import { Property } from '@pkg/types'
import { PropertyDTO } from '../dto'

export interface IPropertiesRepository {
  create(params: PropertyDTO): Promise<Property>
}
