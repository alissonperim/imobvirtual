import { Address, Property } from '@pkg/types'
import type { FindOptionsRelations } from 'typeorm'
import type { PropertyEntity, AddressEntity } from '@app/database/entities'

export const relationsQuery: FindOptionsRelations<PropertyEntity> = {
  owner: true,
}

export const mapAddress = (addr: AddressEntity): Address => {
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

export const mapRow = (row: PropertyEntity): Property => {
  return {
    id: row.id,
    description: row.description ?? undefined,
    rentAmount: Number(row.rentAmount),
    solarEnergyActive: row.solarEnergyActive,
    status: row.status,
    owner: {
      id: row.owner.id,
      name: row.owner.name,
      lastName: row.owner.lastName,
      document: row.owner.document,
      phoneNumber: row.owner.phoneNumber,
      maritalStatus: row.owner.maritalStatus,
      email: row.owner.email ?? undefined,
      accountId: row.owner.accountId,
      addressId: row.owner.addressId,
      properties: [],
      createdAt: row.owner.createdAt,
      updatedAt: row.owner.updatedAt,
      deletedAt: row.owner.deletedAt ?? undefined,
      createdBy: row.owner.createdBy ?? undefined,
      updatedBy: row.owner.updatedBy ?? undefined,
    },
    address: row.address ? mapAddress(row.address) : undefined,
    addressId: row.addressId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    deletedAt: row.deletedAt ?? undefined,
    createdBy: row.createdBy ?? undefined,
    updatedBy: row.updatedBy ?? undefined,
  }
}
