import { Inject, Injectable } from '@nestjs/common'
import { Property } from '@pkg/types'
import type { IPropertiesRepository } from '../repositories/domain'
import { PropertyDTO } from '../dto'

@Injectable()
export class CreatePropertyService {
  constructor(
    @Inject('PROPERTIES_REPOSITORY')
    private readonly repository: IPropertiesRepository,
  ) {}

  async execute(params: PropertyDTO): Promise<Property> {
    const property = await this.repository.create(params)
    return await Promise.resolve(property)
  }
}
