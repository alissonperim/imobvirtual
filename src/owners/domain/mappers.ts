import { Address, EMaritalStatus, Owner } from '@pkg/types'
import { Prisma } from '@db-config/generated/client'

export const include = {
  address: true,
} as const

export type OwnerRow = Prisma.OwnerGetPayload<{ include: typeof include }>

export function mapAddress(addr: OwnerRow['address']): Address {
  return {
    id: addr.id,
    street: addr.street,
    neighborhood: addr.neighborhood,
    postalCode: addr.postal_code,
    complement: addr.complement,
    city: addr.city,
    state: addr.state,
    number: addr.number,
    createdAt: addr.created_at,
    updatedAt: addr.updated_at,
    deletedAt: addr.deleted_at ?? undefined,
    createdBy: addr.created_by ?? undefined,
    updatedBy: addr.updated_by ?? undefined,
  }
}

export function mapOwner(row: OwnerRow): Owner {
  return {
    id: row.id,
    name: row.name,
    document: row.document,
    phoneNumber: row.phone_number,
    email: row.email ?? undefined,
    maritalStatus: row.marital_status as EMaritalStatus,
    accountId: row.account_id,
    address: mapAddress(row.address),
    properties: [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at ?? undefined,
    createdBy: row.created_by ?? undefined,
    updatedBy: row.updated_by ?? undefined,
  }
}
