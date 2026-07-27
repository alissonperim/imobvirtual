import { Inject, Injectable } from '@nestjs/common'
import { Owner } from '@pkg/types'
import type { Pagination } from '@pkg/utils'
import type { IOwnersRepository } from '../repositories/domain'
import type { FindAllOwnersInput } from '../domain/owner'

export interface IFindAllOwnersUseCase {
  execute(filters: FindAllOwnersInput): Promise<Pagination<Owner>>
}

@Injectable()
export class FindAllOwnersUseCase implements IFindAllOwnersUseCase {
  constructor(
    @Inject('OWNERS_REPOSITORY')
    private readonly repository: IOwnersRepository,
  ) {}

  async execute(filters: FindAllOwnersInput): Promise<Pagination<Owner>> {
    return this.repository.findAll(filters)
  }
}
