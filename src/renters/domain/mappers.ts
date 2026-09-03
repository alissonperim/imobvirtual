import { Address, Renter } from '@pkg/types'
import type { AddressEntity, RenterEntity } from '@app/database/entities'

function mapAddress(addr: AddressEntity): Address {
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

export function mapRenter(row: RenterEntity): Renter {
  return {
    id: row.id,
    name: row.name,
    lastName: row.lastName,
    document: row.document,
    phoneNumber: row.phoneNumber,
    email: row.email,
    maritalStatus: row.maritalStatus,
    accountId: row.accountId,
    address: row.address ? mapAddress(row.address) : undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    deletedAt: row.deletedAt ?? undefined,
    createdBy: row.createdBy ?? undefined,
    updatedBy: row.updatedBy ?? undefined,
  }
}
