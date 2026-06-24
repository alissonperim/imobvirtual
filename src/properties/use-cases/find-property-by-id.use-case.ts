import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { Property } from '@pkg/types'
import type { IPropertiesRepository } from '../repositories/domain'

export interface IFindPropertyByIdUseCase {
  execute(id: string): Promise<Property>
}

@Injectable()
export class FindPropertyByIdUseCase implements IFindPropertyByIdUseCase {
  constructor(
    @Inject('PROPERTIES_REPOSITORY')
    private readonly repository: IPropertiesRepository,
  ) {}

  async execute(id: string): Promise<Property> {
    const property = await this.repository.findById(id)
    if (!property) throw new NotFoundException(`Property ${id} not found`)
    return property
  }
}
