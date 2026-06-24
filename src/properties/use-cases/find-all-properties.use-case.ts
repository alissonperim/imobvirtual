import { Inject, Injectable } from '@nestjs/common'
import { Property } from '@pkg/types'
import type { Pagination } from '@pkg/utils'
import type { IPropertiesRepository } from '../repositories/domain'
import type { FindAllPropertiesInput } from '../dto'

export interface IFindAllPropertiesUseCase {
  execute(filters: FindAllPropertiesInput): Promise<Pagination<Property>>
}

@Injectable()
export class FindAllPropertiesUseCase implements IFindAllPropertiesUseCase {
  constructor(
    @Inject('PROPERTIES_REPOSITORY')
    private readonly repository: IPropertiesRepository,
  ) {}

  async execute(filters: FindAllPropertiesInput): Promise<Pagination<Property>> {
    return this.repository.findAll(filters)
  }
}
