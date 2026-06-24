import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import type { IPropertiesRepository } from '../repositories/domain'

export interface IDeletePropertyUseCase {
  execute(id: string): Promise<void>
}

@Injectable()
export class DeletePropertyUseCase implements IDeletePropertyUseCase {
  constructor(
    @Inject('PROPERTIES_REPOSITORY')
    private readonly repository: IPropertiesRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const deleted = await this.repository.softDelete(id)
    if (!deleted) throw new NotFoundException(`Property ${id} not found`)
  }
}
