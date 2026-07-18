import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { IsNull, Repository } from 'typeorm'
import type { Owner } from '@pkg/types'
import { removeUndefinedValues, type Pagination } from '@pkg/utils'
import { wasAffected } from '@pkg/utils/error-utils'
import {
  AccountEntity,
  AddressEntity,
  OwnerEntity,
} from '@app/database/entities'
import type { IOwnersRepository } from '../domain'
import type {
  CreateOwnerInput,
  FindAllOwnersInput,
  UpdateOwnerInput,
} from '../../dto'
import { mapOwner } from '../../domain/mappers'

const MAX_PAGE_SIZE = 100

@Injectable()
export class OwnersRepository implements IOwnersRepository {
  constructor(
    @InjectRepository(OwnerEntity)
    private readonly repository: Repository<OwnerEntity>,
  ) {}

  async create(params: CreateOwnerInput): Promise<Owner> {
    const entity = this.repository.create({
      name: params.name,
      document: params.document,
      phoneNumber: params.phoneNumber,
      email: params.email,
      maritalStatus: params.maritalStatus,
      account: { id: params.accountId } as AccountEntity,
      address: { id: params.addressId } as AddressEntity,
      createdBy: params.createdBy,
    })
    const saved = await this.repository.save(entity)

    const row = await this.repository.findOneOrFail({
      where: { id: saved.id },
      relations: { address: true },
    })
    return mapOwner(row)
  }

  async findAll(filters: FindAllOwnersInput): Promise<Pagination<Owner>> {
    const page = Number(filters.page) || 1
    const pageSize = Math.min(Number(filters.pageSize) || 20, MAX_PAGE_SIZE)
    const skip = (page - 1) * pageSize

    const rows = await this.repository.find({
      where: { deletedAt: IsNull() },
      skip,
      take: pageSize + 1,
      relations: { address: true },
      order: { createdAt: 'DESC' },
    })

    const hasMore = rows.length > pageSize
    const data = hasMore ? rows.slice(0, pageSize) : rows

    return { data: data.map(mapOwner), hasMore }
  }

  async findById(id: string): Promise<Owner | null> {
    const row = await this.repository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: { address: true },
    })
    return row ? mapOwner(row) : null
  }

  async update(id: string, params: UpdateOwnerInput): Promise<Owner | null> {
    const existing = await this.repository.findOne({
      where: { id, deletedAt: IsNull() },
    })
    if (!existing) return null

    const { accountId, addressId, ...rest } = removeUndefinedValues(
      params as unknown as Record<string, unknown>,
    ) as UpdateOwnerInput

    Object.assign(existing, rest)
    if (accountId) existing.account = { id: accountId } as AccountEntity
    if (addressId) existing.address = { id: addressId } as AddressEntity

    await this.repository.save(existing)

    const row = await this.repository.findOneOrFail({
      where: { id },
      relations: { address: true },
    })
    return mapOwner(row)
  }

  async softDelete(id: string): Promise<boolean> {
    const result = await this.repository.update(
      { id, deletedAt: IsNull() },
      { deletedAt: new Date() },
    )
    return wasAffected(result)
  }
}
