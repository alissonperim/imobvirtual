import { CreateRenterRepositoryInput } from '@app/renters/domain'
import { IRenterRepository } from '../domain'
import { Inject, Injectable } from '@nestjs/common'
import { RenterEntity } from '@app/database/entities'
import { Repository } from 'typeorm'

@Injectable()
export class RenterRepository implements IRenterRepository {
  constructor(
    @Inject(RenterEntity)
    private readonly repository: Repository<RenterEntity>,
  ) {}
  async create(params: CreateRenterRepositoryInput): Promise<RenterEntity> {
    const entity = this.repository.create({
      name: params.name,
      lastName: params.lastName,
      email: params.email,
      phoneNumber: params.phoneNumber,
    })

    return await this.repository.save(entity)
  }
}
