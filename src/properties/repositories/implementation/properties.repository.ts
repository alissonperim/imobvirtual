import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { IsNull, Repository } from 'typeorm'
import { Property } from '@pkg/types'
import { removeUndefinedValues, type Pagination } from '@pkg/utils'
import { wasAffected } from '@pkg/utils/error-utils'
import {
  AddressEntity,
  OwnerEntity,
  PropertyEntity,
} from '@app/database/entities'
import type { IPropertiesRepository } from '../domain'
import type {
  CreatePropertyInput,
  FindAllPropertiesInput,
  UpdatePropertyInput,
} from '../../dto'
import { mapRow, relationsQuery } from '@app/properties/dto/domain'

const MAX_PAGE_SIZE = 100

@Injectable()
export class PropertiesRepository implements IPropertiesRepository {
  constructor(
    @InjectRepository(PropertyEntity)
    private readonly repository: Repository<PropertyEntity>,
  ) {}

  async create(params: CreatePropertyInput): Promise<Property> {
    const entity = this.repository.create({
      name: params.name,
      description: params.description,
      baseRentAmount: params.baseRentAmount,
      solarEnergyActive: params.solarEnergyActive,
      status: params.status,
      owner: { id: params.ownerId } as OwnerEntity,
      address: params.addressId ? { id: params.addressId } : null,
      createdBy: params.createdBy,
    })
    const saved = await this.repository.save(entity)

    const row = await this.repository.findOneOrFail({
      where: { id: saved.id },
      relations: relationsQuery,
    })
    return mapRow(row)
  }

  async findAll(
    filters: FindAllPropertiesInput,
  ): Promise<Pagination<Property>> {
    const page = Number(filters.page) || 1
    const pageSize = Math.min(Number(filters.pageSize) || 20, MAX_PAGE_SIZE)
    const { ownerId, status } = filters
    const skip = (page - 1) * pageSize

    const where = {
      deletedAt: IsNull(),
      ...(ownerId && { owner: { id: ownerId } }),
      ...(status && { status }),
    }

    const rows = await this.repository.find({
      where,
      skip,
      take: pageSize + 1,
      relations: relationsQuery,
      order: { createdAt: 'DESC' },
    })

    const hasMore = rows.length > pageSize
    const data = hasMore ? rows.slice(0, pageSize) : rows

    return { data: data.map(mapRow), hasMore }
  }

  async findById(id: string): Promise<Property | null> {
    const row = await this.repository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: relationsQuery,
    })
    return row ? mapRow(row) : null
  }

  async update(
    id: string,
    params: UpdatePropertyInput,
  ): Promise<Property | null> {
    const existing = await this.repository.findOne({
      where: { id, deletedAt: IsNull() },
    })
    if (!existing) return null

    const { ownerId, addressId, ...rest } = removeUndefinedValues(
      params as unknown as Record<string, unknown>,
    ) as UpdatePropertyInput

    Object.assign(existing, rest)
    if (ownerId) existing.owner = { id: ownerId } as OwnerEntity
    if (addressId) existing.address = { id: addressId } as AddressEntity

    await this.repository.save(existing)

    const row = await this.repository.findOneOrFail({
      where: { id },
      relations: relationsQuery,
    })
    return mapRow(row)
  }

  async softDelete(id: string): Promise<boolean> {
    const result = await this.repository.update(
      { id, deletedAt: IsNull() },
      { deletedAt: new Date() },
    )
    return wasAffected(result)
  }
}
