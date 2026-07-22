import { Address, Owner } from '@pkg/types'
import type { OwnerEntity, AddressEntity } from '@app/database/entities'

export function mapAddress(addr: AddressEntity): Address {
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

export function mapOwner(row: OwnerEntity): Owner {
  return {
    id: row.id,
    name: row.name,
    lastName: row.name,
    document: row.document,
    phoneNumber: row.phoneNumber,
    email: row.email ?? undefined,
    maritalStatus: row.maritalStatus,
    accountId: row.accountId,
    address: mapAddress(row.address),
    properties: [],
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    deletedAt: row.deletedAt ?? undefined,
    createdBy: row.createdBy ?? undefined,
    updatedBy: row.updatedBy ?? undefined,
  }
}
