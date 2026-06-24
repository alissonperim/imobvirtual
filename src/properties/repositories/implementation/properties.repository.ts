import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { Property, EPropertyStatus, EMaritalStatus } from '@pkg/types'
import type { Address } from '@pkg/types'
import { removeUndefinedValues, type Pagination } from '@pkg/utils'
import { PrismaService } from '@app/prisma/prisma.service'
import type { IPropertiesRepository } from '../domain'
import type {
  CreatePropertyInput,
  FindAllPropertiesInput,
  UpdatePropertyInput,
} from '../../dto'

const include = {
  owner: { include: { address: true } },
  address: true,
} as const

type PropertyWithRelations = Prisma.PropertyGetPayload<{
  include: typeof include
}>

const MAX_PAGE_SIZE = 100

function mapAddress(
  addr: NonNullable<PropertyWithRelations['address']>,
): Address {
  return {
    id: addr.id,
    street: addr.street,
    neighborhood: addr.neighborhood,
    postalCode: addr.postalCode,
    complement: addr.complement,
    city: addr.city,
    state: addr.state,
    number: addr.number,
    createdAt: addr.createdAt,
    updatedAt: addr.updatedAt,
    deletedAt: addr.deletedAt ?? undefined,
    createdBy: addr.createdBy ?? undefined,
    updatedBy: addr.updatedBy ?? undefined,
  }
}

function mapRow(row: PropertyWithRelations): Property {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    baseRentAmount: Number(row.baseRentAmount),
    solarEnergyActive: row.solarEnergyActive,
    status: row.status as EPropertyStatus,
    owner: {
      id: row.owner.id,
      name: row.owner.name,
      document: row.owner.document,
      phoneNumber: row.owner.phoneNumber,
      maritalStatus: row.owner.maritalStatus as EMaritalStatus,
      email: row.owner.email ?? undefined,
      accountId: row.owner.accountId,
      address: mapAddress(row.owner.address),
      properties: [],
      createdAt: row.owner.createdAt,
      updatedAt: row.owner.updatedAt,
      deletedAt: row.owner.deletedAt ?? undefined,
      createdBy: row.owner.createdBy ?? undefined,
      updatedBy: row.owner.updatedBy ?? undefined,
    },
    address: row.address ? mapAddress(row.address) : undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    deletedAt: row.deletedAt ?? undefined,
    createdBy: row.createdBy ?? undefined,
    updatedBy: row.updatedBy ?? undefined,
  }
}

function isP2025(e: unknown): boolean {
  return e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025'
}

@Injectable()
export class PropertiesRepository implements IPropertiesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(params: CreatePropertyInput): Promise<Property> {
    const row = await this.prisma.property.create({
      data: {
        name: params.name,
        description: params.description,
        baseRentAmount: params.baseRentAmount,
        solarEnergyActive: params.solarEnergyActive,
        status: params.status,
        ownerId: params.ownerId,
        addressId: params.addressId,
        createdBy: params.createdBy,
      },
      include,
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
      include,
      orderBy: { createdAt: 'desc' },
    })

    const hasMore = rows.length > pageSize
    const data = hasMore ? rows.slice(0, pageSize) : rows

    return { data: data.map(mapRow), hasMore }
  }

  async findById(id: string): Promise<Property | null> {
    const row = await this.prisma.property.findFirst({
      where: { id, deletedAt: null },
      include,
    })
    return row ? mapRow(row) : null
  }

  async update(
    id: string,
    params: UpdatePropertyInput,
  ): Promise<Property | null> {
    try {
      const row = await this.prisma.property.update({
        where: { id, deletedAt: null },
        data: {
          ...removeUndefinedValues(params),
        },
        include,
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
        where: { id, deletedAt: null },
        data: { deletedAt: new Date() },
      })
      return true
    } catch (e) {
      if (isP2025(e)) return false
      throw e
    }
  }
}
