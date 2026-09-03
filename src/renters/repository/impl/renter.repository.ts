import { CreateRenterRepositoryInput } from '@app/renters/domain'
import { IRenterRepository } from '../domain'
import { Injectable } from '@nestjs/common'
import { RenterEntity } from '@app/database/entities'
import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { EAccountStatus, Renter } from '@pkg/types'
import { mapRenter } from '@app/renters/domain/mappers'
import { resolveRepository } from '@app/database/transaction/resolve-repository'

@Injectable()
export class RenterRepository implements IRenterRepository {
  constructor(
    @InjectRepository(RenterEntity)
    private readonly repository: Repository<RenterEntity>,
  ) {}

  async create(params: CreateRenterRepositoryInput): Promise<Renter> {
    const repository = resolveRepository(this.repository, RenterEntity)

    const entity = repository.create({
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

    const saved = await repository.save(entity)

    const fullEntity = await repository.findOneOrFail({
      where: { id: saved.id },
      relations: { address: true },
    })

    return mapRenter(fullEntity)
  }
}
