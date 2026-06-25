import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import type { IOwnersRepository } from '../repositories/domain'

export interface IDeleteOwnerUseCase {
  execute(id: string): Promise<void>
}

@Injectable()
export class DeleteOwnerUseCase implements IDeleteOwnerUseCase {
  constructor(
    @Inject('OWNERS_REPOSITORY')
    private readonly repository: IOwnersRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const deleted = await this.repository.softDelete(id)
    if (!deleted) throw new NotFoundException(`Owner ${id} not found`)
  }
}
