import { CreateRenterRepositoryInput } from '@app/renters/domain'
import { IRenterRepository } from '../domain'
import { Injectable } from '@nestjs/common'
import { RenterEntity } from '@app/database/entities'
import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { EAccountStatus } from '@pkg/types'

@Injectable()
export class RenterRepository implements IRenterRepository {
  constructor(
    @InjectRepository(RenterEntity)
    private readonly repository: Repository<RenterEntity>,
  ) {}
  async create(params: CreateRenterRepositoryInput): Promise<RenterEntity> {
    const entity = this.repository.create({
      name: params.name,
      lastName: params.lastName,
      email: params.email,
      phoneNumber: params.phoneNumber,
      account: {
        role: params.account.role,
        otps: params.account.otps,
        status: EAccountStatus.ACTIVE,
      },
    })

    return await this.repository.save(entity)
  }
}
