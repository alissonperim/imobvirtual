import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
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
        phoneNumber: params.phoneNumber,
        email: params.email,
        maritalStatus: params.maritalStatus,
        accountId: params.accountId,
        addressId: params.addressId,
        createdBy: params.createdBy,
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
      where: { deletedAt: null },
      skip,
      take: pageSize + 1,
      include,
      orderBy: { createdAt: 'desc' },
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
