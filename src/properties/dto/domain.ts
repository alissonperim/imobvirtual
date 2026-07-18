import { Address, EMaritalStatus, EPropertyStatus, Property } from '@pkg/types'
import { Prisma } from '@db-config/generated/client'

export const includeQuery = {
  owner: { include: { address: true } },
  address: true,
} as const

type PropertyWithRelations = Prisma.PropertyGetPayload<{
  include: typeof includeQuery
}>

export const mapAddress = (
  addr: NonNullable<PropertyWithRelations['address']>,
): Address => {
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

export const mapRow = (row: PropertyWithRelations): Property => {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    baseRentAmount: Number(row.base_rent_amount),
    solarEnergyActive: row.solar_energy_active,
    status: row.status as EPropertyStatus,
    owner: {
      id: row.owner.id,
      name: row.owner.name,
      document: row.owner.document,
      phoneNumber: row.owner.phone_number,
      maritalStatus: row.owner.marital_status as EMaritalStatus,
      email: row.owner.email ?? undefined,
      accountId: row.owner.account_id,
      address: mapAddress(row.owner.address),
      properties: [],
      createdAt: row.owner.created_at,
      updatedAt: row.owner.updated_at,
      deletedAt: row.owner.deleted_at ?? undefined,
      createdBy: row.owner.created_by ?? undefined,
      updatedBy: row.owner.updated_by ?? undefined,
    },
    address: row.address ? mapAddress(row.address) : undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at ?? undefined,
    createdBy: row.created_by ?? undefined,
    updatedBy: row.updated_by ?? undefined,
  }
}
