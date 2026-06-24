import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { Property } from '@pkg/types'
import type { IPropertiesRepository } from '../repositories/domain'
import type { UpdatePropertyInput } from '../dto'

export interface IUpdatePropertyUseCase {
  execute(id: string, params: UpdatePropertyInput): Promise<Property>
}

@Injectable()
export class UpdatePropertyUseCase implements IUpdatePropertyUseCase {
  constructor(
    @Inject('PROPERTIES_REPOSITORY')
    private readonly repository: IPropertiesRepository,
  ) {}

  async execute(id: string, params: UpdatePropertyInput): Promise<Property> {
    const updated = await this.repository.update(id, params)
    if (!updated) throw new NotFoundException(`Property ${id} not found`)
    return updated
  }
}
