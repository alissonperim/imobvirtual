import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { Owner } from '@pkg/types'
import type { IOwnersRepository } from '../repositories/domain'
import type { UpdateOwnerInput } from '../dto'

export interface IUpdateOwnerUseCase {
  execute(id: string, params: UpdateOwnerInput): Promise<Owner>
}

@Injectable()
export class UpdateOwnerUseCase implements IUpdateOwnerUseCase {
  constructor(
    @Inject('OWNERS_REPOSITORY')
    private readonly repository: IOwnersRepository,
  ) {}

  async execute(id: string, params: UpdateOwnerInput): Promise<Owner> {
    const updated = await this.repository.update(id, params)
    if (!updated) throw new NotFoundException(`Owner ${id} not found`)
    return updated
  }
}
