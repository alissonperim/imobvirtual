import { Inject, Injectable } from '@nestjs/common'
import { Owner } from '@pkg/types'
import type { IOwnersRepository } from '../repositories/domain'
import { RegisterOwnerInput } from '../domain/owner'

export interface IOwnerService {
  register(params: RegisterOwnerInput): Promise<Owner>
}

@Injectable()
export class OwnerService implements IOwnerService {
  constructor(
    @Inject('OWNERS_REPOSITORY')
    private readonly repository: IOwnersRepository,
  ) {}

  async register(params: RegisterOwnerInput): Promise<Owner> {
    return this.repository.create({
      ...params,
      createdBy: 'fix for while, change later',
    })
  }
}
