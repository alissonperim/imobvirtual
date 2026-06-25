import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { Owner } from '@pkg/types'
import type { IOwnersRepository } from '../repositories/domain'

export interface IFindOwnerByIdUseCase {
  execute(id: string): Promise<Owner>
}

@Injectable()
export class FindOwnerByIdUseCase implements IFindOwnerByIdUseCase {
  constructor(
    @Inject('OWNERS_REPOSITORY')
    private readonly repository: IOwnersRepository,
  ) {}

  async execute(id: string): Promise<Owner> {
    const owner = await this.repository.findById(id)
    if (!owner) throw new NotFoundException(`Owner ${id} not found`)
    return owner
  }
}
