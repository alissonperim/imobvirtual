import { Renter } from '@pkg/types'
import { RenterRegisterInput } from '../domain'
import { Inject, Injectable } from '@nestjs/common'
import type { IRenterRepository } from '../repository/domain'

export interface IRenterService {
  register(params: RenterRegisterInput): Promise<Renter>
}

@Injectable()
export class RenterService implements IRenterService {
  constructor(
    @Inject('RENTER_REPOSITORY')
    private readonly repository: IRenterRepository,
  ) {}

  async register(params: RenterRegisterInput): Promise<Renter> {
    return await this.repository.create(params)
  }
}
