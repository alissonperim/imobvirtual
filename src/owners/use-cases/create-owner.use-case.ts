import { Inject, Injectable } from '@nestjs/common'
import { Owner } from '@pkg/types'
import type { IOwnersRepository } from '../repositories/domain'
import type { CreateOwnerInput } from '../dto'

export interface ICreateOwnerUseCase {
  execute(params: CreateOwnerInput): Promise<Owner>
}

@Injectable()
export class CreateOwnerUseCase implements ICreateOwnerUseCase {
  constructor(
    @Inject('OWNERS_REPOSITORY')
    private readonly repository: IOwnersRepository,
  ) {}

  async execute(params: CreateOwnerInput): Promise<Owner> {
    return this.repository.create(params)
  }
}
