import { Injectable } from '@nestjs/common'
import type { Owner } from '@pkg/types'
import { removeUndefinedValues, type Pagination } from '@pkg/utils'
import { PrismaService } from '@app/prisma/prisma.service'
import type { IOwnersRepository } from '../domain'
import type {
  CreateOwnerInput,
  FindAllOwnersInput,
  UpdateOwnerInput,
} from '../../dto'
import { include, mapOwner } from '../../domain/mappers'
import { Prisma } from '@prisma/generated/client'

const MAX_PAGE_SIZE = 100

function isP2025(e: unknown): boolean {
  return e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025'
}

@Injectable()
export class OwnersRepository implements IOwnersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(params: CreateOwnerInput): Promise<Owner> {
    const row = await this.prisma.owner.create({
      data: {
        name: params.name,
        document: params.document,
        phone_number: params.phoneNumber,
        email: params.email,
        marital_status: params.maritalStatus,
        account_id: params.accountId,
        address_id: params.addressId,
        created_by: params.createdBy,
      },
      include,
    })
    return mapOwner(row)
  }

  async findAll(filters: FindAllOwnersInput): Promise<Pagination<Owner>> {
    const page = Number(filters.page) || 1
    const pageSize = Math.min(Number(filters.pageSize) || 20, MAX_PAGE_SIZE)
    const skip = (page - 1) * pageSize

    const rows = await this.prisma.owner.findMany({
      where: { deleted_at: null },
      skip,
      take: pageSize + 1,
      include,
      orderBy: { created_at: 'desc' },
    })

    const hasMore = rows.length > pageSize
    const data = hasMore ? rows.slice(0, pageSize) : rows

    return { data: data.map(mapOwner), hasMore }
  }

  async findById(id: string): Promise<Owner | null> {
    const row = await this.prisma.owner.findFirst({
      where: { id, deletedAt: null },
      include,
    })
    return row ? mapOwner(row) : null
  }

  async update(id: string, params: UpdateOwnerInput): Promise<Owner | null> {
    try {
      const row = await this.prisma.owner.update({
        where: { id, deletedAt: null },
        data: { ...removeUndefinedValues(params as Record<string, unknown>) },
        include,
      })
      return mapOwner(row)
    } catch (e) {
      if (isP2025(e)) return null
      throw e
    }
  }

  async softDelete(id: string): Promise<boolean> {
    try {
      await this.prisma.owner.update({
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
