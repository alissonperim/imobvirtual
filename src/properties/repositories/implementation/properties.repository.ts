import { Injectable } from '@nestjs/common'
import { Property, EPropertyStatus } from '@pkg/types'
import { PrismaService } from '@app/prisma/prisma.service'
import type { IPropertiesRepository } from '../domain'
import type { PropertyDTO } from '@app/properties/dto'

@Injectable()
export class PropertiesRepository implements IPropertiesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(params: PropertyDTO): Promise<Property> {
    const row = await this.prisma.property.create({
      data: {
        name: params.name,
        description: params.description,
        baseRentAmount: params.baseRentAmount,
        solarEnergyActive: params.solarEnergyActive,
        status: params.status,
        ownerId: params.owner.id,
        addressId: params.address?.id,
      },
      include: { owner: { include: { address: true } }, address: true },
    })

    return {
      id: row.id,
      name: row.name,
      description: row.description ?? undefined,
      baseRentAmount: Number(row.baseRentAmount),
      solarEnergyActive: row.solarEnergyActive,
      status: row.status as EPropertyStatus,
      owner: row.owner as unknown as Property['owner'],
      address: row.address
        ? {
            ...row.address,
            deletedAt: row.address.deletedAt ?? undefined,
            createdBy: row.address.createdBy ?? undefined,
            updatedBy: row.address.updatedBy ?? undefined,
          }
        : undefined,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      deletedAt: row.deletedAt ?? undefined,
      createdBy: row.createdBy ?? undefined,
      updatedBy: row.updatedBy ?? undefined,
    }
  }
}
