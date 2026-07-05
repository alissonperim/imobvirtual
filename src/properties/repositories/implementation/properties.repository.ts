import { Injectable } from '@nestjs/common'
import { Property } from '@pkg/types'
import { removeUndefinedValues, type Pagination } from '@pkg/utils'
import { PrismaService } from '@app/prisma/prisma.service'
import type { IPropertiesRepository } from '../domain'
import type {
  CreatePropertyInput,
  FindAllPropertiesInput,
  UpdatePropertyInput,
} from '../../dto'
import { includeQuery, mapRow } from '@app/properties/dto/domain'
import { isP2025 } from '@pkg/utils/error-utils'

const MAX_PAGE_SIZE = 100

@Injectable()
export class PropertiesRepository implements IPropertiesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(params: CreatePropertyInput): Promise<Property> {
    const row = await this.prisma.property.create({
      data: {
        name: params.name,
        description: params.description,
        base_rent_amount: params.baseRentAmount,
        solar_energy_active: params.solarEnergyActive,
        status: params.status,
        owner_id: params.ownerId,
        address_id: params.addressId,
        created_by: params.createdBy,
      },
      include: includeQuery,
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
      deletedAt: null,
      ...(ownerId && { ownerId }),
      ...(status && { status }),
    }

    const rows = await this.prisma.property.findMany({
      where,
      skip,
      take: pageSize + 1,
      include: includeQuery,
      orderBy: { created_at: 'desc' },
    })

    const hasMore = rows.length > pageSize
    const data = hasMore ? rows.slice(0, pageSize) : rows

    return { data: data.map(mapRow), hasMore }
  }

  async findById(id: string): Promise<Property | null> {
    const row = await this.prisma.property.findFirst({
      where: { id, deleted_at: null },
      include: includeQuery,
    })
    return row ? mapRow(row) : null
  }

  async update(
    id: string,
    params: UpdatePropertyInput,
  ): Promise<Property | null> {
    try {
      const row = await this.prisma.property.update({
        where: { id, deleted_at: null },
        data: {
          ...removeUndefinedValues(params as Record<string, unknown>),
        },
        include: includeQuery,
      })
      return mapRow(row)
    } catch (e) {
      if (isP2025(e)) return null
      throw e
    }
  }

  async softDelete(id: string): Promise<boolean> {
    try {
      await this.prisma.property.update({
        where: { id, deleted_at: null },
        data: { deleted_at: new Date() },
      })
      return true
    } catch (e) {
      if (isP2025(e)) return false
      throw e
    }
  }
}
