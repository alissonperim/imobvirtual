import { EMaritalStatus, EPropertyStatus } from '@pkg/types'
import type { PrismaService } from '@app/prisma/prisma.service'
import { PropertiesRepository } from '../properties.repository'
import { Prisma } from '@prisma/generated/client'

const makeAddressRow = (overrides: object = {}) => ({
  id: 'addr-id',
  street: 'Rua A',
  neighborhood: 'Centro',
  postalCode: '74000-000',
  complement: 'Apto 1',
  city: 'Goiânia',
  state: 'GO',
  number: '100',
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  deletedAt: null,
  createdBy: null,
  updatedBy: null,
  ...overrides,
})

const makeOwnerRow = (overrides: object = {}) => ({
  id: 'owner-id',
  name: 'John Doe',
  document: '12345678900',
  phoneNumber: '62999999999',
  email: null,
  maritalStatus: 'SINGLE',
  accountId: 'account-id',
  addressId: 'addr-id',
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  deletedAt: null,
  createdBy: null,
  updatedBy: null,
  address: makeAddressRow(),
  ...overrides,
})

const makePropertyRow = (overrides: object = {}) => ({
  id: 'property-id',
  name: 'Casa Verde',
  description: null,
  baseRentAmount: new Prisma.Decimal('1500.00'),
  solarEnergyActive: false,
  status: 'AVAILABLE',
  ownerId: 'owner-id',
  addressId: null,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  deletedAt: null,
  createdBy: null,
  updatedBy: null,
  owner: makeOwnerRow(),
  address: null,
  ...overrides,
})

const makeP2025 = () =>
  new Prisma.PrismaClientKnownRequestError('Record to update not found.', {
    code: 'P2025',
    clientVersion: '5.0.0',
  })

describe('PropertiesRepository', () => {
  let prisma: { property: Record<string, jest.Mock> }
  let sut: PropertiesRepository

  beforeEach(() => {
    prisma = {
      property: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
    }
    sut = new PropertiesRepository(prisma as unknown as PrismaService)
  })

  describe('create', () => {
    it('should convert Decimal baseRentAmount to number', async () => {
      prisma.property.create.mockResolvedValue(makePropertyRow())

      const result = await sut.create({
        name: 'Casa Verde',
        baseRentAmount: 1500,
        solarEnergyActive: false,
        status: EPropertyStatus.AVAILABLE,
        ownerId: 'owner-id',
      })

      expect(typeof result.baseRentAmount).toBe('number')
      expect(result.baseRentAmount).toBe(1500)
    })

    it('should map null description to undefined', async () => {
      prisma.property.create.mockResolvedValue(
        makePropertyRow({ description: null }),
      )

      const result = await sut.create({
        name: 'Casa Verde',
        baseRentAmount: 1500,
        solarEnergyActive: false,
        status: EPropertyStatus.AVAILABLE,
        ownerId: 'owner-id',
      })

      expect(result.description).toBeUndefined()
    })

    it('should map null address to undefined', async () => {
      prisma.property.create.mockResolvedValue(
        makePropertyRow({ address: null }),
      )

      const result = await sut.create({
        name: 'Casa Verde',
        baseRentAmount: 1500,
        solarEnergyActive: false,
        status: EPropertyStatus.AVAILABLE,
        ownerId: 'owner-id',
      })

      expect(result.address).toBeUndefined()
    })

    it('should map address nullable fields when address is present', async () => {
      const row = makePropertyRow({
        address: makeAddressRow({
          deletedAt: new Date('2026-06-01'),
          createdBy: 'user-1',
        }),
      })
      prisma.property.create.mockResolvedValue(row)

      const result = await sut.create({
        name: 'Casa Verde',
        baseRentAmount: 1500,
        solarEnergyActive: false,
        status: EPropertyStatus.AVAILABLE,
        ownerId: 'owner-id',
        addressId: 'addr-id',
      })

      expect(result.address?.deletedAt).toEqual(new Date('2026-06-01'))
      expect(result.address?.createdBy).toBe('user-1')
      expect(result.address?.updatedBy).toBeUndefined()
    })

    it('should map null owner email to undefined', async () => {
      prisma.property.create.mockResolvedValue(makePropertyRow())

      const result = await sut.create({
        name: 'Casa Verde',
        baseRentAmount: 1500,
        solarEnergyActive: false,
        status: EPropertyStatus.AVAILABLE,
        ownerId: 'owner-id',
      })

      expect(result.owner.email).toBeUndefined()
    })

    it('should map owner email when present', async () => {
      prisma.property.create.mockResolvedValue(
        makePropertyRow({
          owner: makeOwnerRow({ email: 'owner@example.com' }),
        }),
      )

      const result = await sut.create({
        name: 'Casa Verde',
        baseRentAmount: 1500,
        solarEnergyActive: false,
        status: EPropertyStatus.AVAILABLE,
        ownerId: 'owner-id',
      })

      expect(result.owner.email).toBe('owner@example.com')
    })

    it('should map owner maritalStatus enum correctly', async () => {
      prisma.property.create.mockResolvedValue(makePropertyRow())

      const result = await sut.create({
        name: 'Casa Verde',
        baseRentAmount: 1500,
        solarEnergyActive: false,
        status: EPropertyStatus.AVAILABLE,
        ownerId: 'owner-id',
      })

      expect(result.owner.maritalStatus).toBe(EMaritalStatus.SINGLE)
    })

    it('should pass correct data to prisma.property.create', async () => {
      prisma.property.create.mockResolvedValue(makePropertyRow())

      await sut.create({
        name: 'Casa Verde',
        baseRentAmount: 1500,
        solarEnergyActive: false,
        status: EPropertyStatus.AVAILABLE,
        ownerId: 'owner-id',
        addressId: 'addr-id',
        createdBy: 'account-id',
      })

      expect(prisma.property.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: 'Casa Verde',
            baseRentAmount: 1500,
            solarEnergyActive: false,
            status: EPropertyStatus.AVAILABLE,
            ownerId: 'owner-id',
            addressId: 'addr-id',
            createdBy: 'account-id',
          }),
        }),
      )
    })
  })

  describe('findAll', () => {
    it('should return hasMore:false when rows fit within pageSize', async () => {
      prisma.property.findMany.mockResolvedValue([makePropertyRow()])

      const result = await sut.findAll({ page: 1, pageSize: 20 })

      expect(result.hasMore).toBe(false)
      expect(result.data).toHaveLength(1)
    })

    it('should return hasMore:true and slice data when rows exceed pageSize', async () => {
      const rows = Array.from({ length: 3 }, (_, i) =>
        makePropertyRow({ id: `property-${i}` }),
      )
      prisma.property.findMany.mockResolvedValue(rows)

      const result = await sut.findAll({ page: 1, pageSize: 2 })

      expect(result.hasMore).toBe(true)
      expect(result.data).toHaveLength(2)
    })

    it('should apply deletedAt:null filter always', async () => {
      prisma.property.findMany.mockResolvedValue([])

      await sut.findAll({})

      expect(prisma.property.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ deletedAt: null }),
        }),
      )
    })

    it('should apply ownerId filter when provided', async () => {
      prisma.property.findMany.mockResolvedValue([])

      await sut.findAll({ ownerId: 'owner-id' })

      expect(prisma.property.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ ownerId: 'owner-id' }),
        }),
      )
    })

    it('should apply status filter when provided', async () => {
      prisma.property.findMany.mockResolvedValue([])

      await sut.findAll({ status: EPropertyStatus.RENTED })

      expect(prisma.property.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: EPropertyStatus.RENTED }),
        }),
      )
    })

    it('should default to page=1 and pageSize=20', async () => {
      prisma.property.findMany.mockResolvedValue([])

      await sut.findAll({})

      expect(prisma.property.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 0, take: 21 }),
      )
    })

    it('should calculate correct skip for page > 1', async () => {
      prisma.property.findMany.mockResolvedValue([])

      await sut.findAll({ page: 3, pageSize: 10 })

      expect(prisma.property.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 20, take: 11 }),
      )
    })

    it('should cap pageSize at 100', async () => {
      prisma.property.findMany.mockResolvedValue([])

      await sut.findAll({ pageSize: 9999 })

      expect(prisma.property.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 101 }),
      )
    })

    it('should coerce string page and pageSize from query params', async () => {
      prisma.property.findMany.mockResolvedValue([])

      await sut.findAll({ page: '2' as any, pageSize: '5' as any })

      expect(prisma.property.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 5, take: 6 }),
      )
    })
  })

  describe('findById', () => {
    it('should return null when property is not found', async () => {
      prisma.property.findFirst.mockResolvedValue(null)

      const result = await sut.findById('property-id')

      expect(result).toBeNull()
    })

    it('should return mapped property when found', async () => {
      prisma.property.findFirst.mockResolvedValue(makePropertyRow())

      const result = await sut.findById('property-id')

      expect(result).toMatchObject({
        id: 'property-id',
        name: 'Casa Verde',
        baseRentAmount: 1500,
        status: EPropertyStatus.AVAILABLE,
      })
    })

    it('should query with id and deletedAt:null filter', async () => {
      prisma.property.findFirst.mockResolvedValue(null)

      await sut.findById('property-id')

      expect(prisma.property.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'property-id', deletedAt: null },
        }),
      )
    })
  })

  describe('update', () => {
    it('should return mapped property on success', async () => {
      prisma.property.update.mockResolvedValue(
        makePropertyRow({ name: 'Casa Azul' }),
      )

      const result = await sut.update('property-id', { name: 'Casa Azul' })

      expect(result).toMatchObject({ id: 'property-id', name: 'Casa Azul' })
    })

    it('should return null when P2025 is thrown', async () => {
      prisma.property.update.mockRejectedValue(makeP2025())

      const result = await sut.update('property-id', { name: 'Casa Azul' })

      expect(result).toBeNull()
    })

    it('should rethrow errors other than P2025', async () => {
      const unexpectedError = new Error('database connection failed')
      prisma.property.update.mockRejectedValue(unexpectedError)

      await expect(
        sut.update('property-id', { name: 'Casa Azul' }),
      ).rejects.toThrow('database connection failed')
    })

    it('should call prisma.update with where deletedAt:null', async () => {
      prisma.property.update.mockResolvedValue(makePropertyRow())

      await sut.update('property-id', { name: 'Casa Azul' })

      expect(prisma.property.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            id: 'property-id',
            deletedAt: null,
          }),
        }),
      )
    })
  })

  describe('softDelete', () => {
    it('should return true when record is deleted successfully', async () => {
      prisma.property.update.mockResolvedValue(makePropertyRow())

      const result = await sut.softDelete('property-id')

      expect(result).toBe(true)
    })

    it('should return false when P2025 is thrown', async () => {
      prisma.property.update.mockRejectedValue(makeP2025())

      const result = await sut.softDelete('property-id')

      expect(result).toBe(false)
    })

    it('should rethrow errors other than P2025', async () => {
      const unexpectedError = new Error('database connection failed')
      prisma.property.update.mockRejectedValue(unexpectedError)

      await expect(sut.softDelete('property-id')).rejects.toThrow(
        'database connection failed',
      )
    })

    it('should call prisma.update with where deletedAt:null and set deletedAt in data', async () => {
      prisma.property.update.mockResolvedValue(makePropertyRow())

      await sut.softDelete('property-id')

      expect(prisma.property.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            id: 'property-id',
            deletedAt: null,
          }),
          data: expect.objectContaining({ deletedAt: expect.any(Date) }),
        }),
      )
    })
  })
})
