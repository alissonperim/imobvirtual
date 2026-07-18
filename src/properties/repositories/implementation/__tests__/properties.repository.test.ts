import { EMaritalStatus, EPropertyStatus } from '@pkg/types'
import type { Repository, UpdateResult } from 'typeorm'
import { PropertiesRepository } from '../properties.repository'
import type {
  AddressEntity,
  OwnerEntity,
  PropertyEntity,
} from '@app/database/entities'

const makeAddressRow = (
  overrides: Partial<AddressEntity> = {},
): AddressEntity =>
  ({
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
  }) as AddressEntity

const makeOwnerRow = (overrides: Partial<OwnerEntity> = {}): OwnerEntity =>
  ({
    id: 'owner-id',
    name: 'John Doe',
    document: '12345678900',
    phoneNumber: '62999999999',
    email: null,
    maritalStatus: EMaritalStatus.SINGLE,
    accountId: 'account-id',
    addressId: 'addr-id',
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    deletedAt: null,
    createdBy: null,
    updatedBy: null,
    address: makeAddressRow(),
    ...overrides,
  }) as OwnerEntity

const makePropertyRow = (
  overrides: Partial<PropertyEntity> = {},
): PropertyEntity =>
  ({
    id: 'property-id',
    name: 'Casa Verde',
    description: null,
    baseRentAmount: 1500,
    solarEnergyActive: false,
    iptuCharge: false,
    status: EPropertyStatus.AVAILABLE,
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
  }) as PropertyEntity

describe('PropertiesRepository', () => {
  let repository: jest.Mocked<
    Pick<
      Repository<PropertyEntity>,
      'create' | 'save' | 'find' | 'findOne' | 'findOneOrFail' | 'update'
    >
  >
  let sut: PropertiesRepository

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      findOneOrFail: jest.fn(),
      update: jest.fn(),
    }
    sut = new PropertiesRepository(
      repository as unknown as Repository<PropertyEntity>,
    )
  })

  describe('create', () => {
    it('should convert baseRentAmount to number', async () => {
      const row = makePropertyRow()
      repository.create.mockReturnValue(row)
      repository.save.mockResolvedValue(row)
      repository.findOneOrFail.mockResolvedValue(row)

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
      const row = makePropertyRow({ description: null })
      repository.create.mockReturnValue(row)
      repository.save.mockResolvedValue(row)
      repository.findOneOrFail.mockResolvedValue(row)

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
      const row = makePropertyRow({ address: null })
      repository.create.mockReturnValue(row)
      repository.save.mockResolvedValue(row)
      repository.findOneOrFail.mockResolvedValue(row)

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
      repository.create.mockReturnValue(row)
      repository.save.mockResolvedValue(row)
      repository.findOneOrFail.mockResolvedValue(row)

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
      const row = makePropertyRow()
      repository.create.mockReturnValue(row)
      repository.save.mockResolvedValue(row)
      repository.findOneOrFail.mockResolvedValue(row)

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
      const row = makePropertyRow({
        owner: makeOwnerRow({ email: 'owner@example.com' }),
      })
      repository.create.mockReturnValue(row)
      repository.save.mockResolvedValue(row)
      repository.findOneOrFail.mockResolvedValue(row)

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
      const row = makePropertyRow()
      repository.create.mockReturnValue(row)
      repository.save.mockResolvedValue(row)
      repository.findOneOrFail.mockResolvedValue(row)

      const result = await sut.create({
        name: 'Casa Verde',
        baseRentAmount: 1500,
        solarEnergyActive: false,
        status: EPropertyStatus.AVAILABLE,
        ownerId: 'owner-id',
      })

      expect(result.owner.maritalStatus).toBe(EMaritalStatus.SINGLE)
    })
  })

  describe('findAll', () => {
    it('should return hasMore:false when rows fit within pageSize', async () => {
      repository.find.mockResolvedValue([makePropertyRow()])

      const result = await sut.findAll({ page: 1, pageSize: 20 })

      expect(result.hasMore).toBe(false)
      expect(result.data).toHaveLength(1)
    })

    it('should return hasMore:true and slice data when rows exceed pageSize', async () => {
      const rows = Array.from({ length: 3 }, (_, i) =>
        makePropertyRow({ id: `property-${i}` }),
      )
      repository.find.mockResolvedValue(rows)

      const result = await sut.findAll({ page: 1, pageSize: 2 })

      expect(result.hasMore).toBe(true)
      expect(result.data).toHaveLength(2)
    })

    it('should apply ownerId filter when provided', async () => {
      repository.find.mockResolvedValue([])

      await sut.findAll({ ownerId: 'owner-id' })

      expect(repository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ owner: { id: 'owner-id' } }),
        }),
      )
    })

    it('should apply status filter when provided', async () => {
      repository.find.mockResolvedValue([])

      await sut.findAll({ status: EPropertyStatus.RENTED })

      expect(repository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: EPropertyStatus.RENTED }),
        }),
      )
    })

    it('should default to page=1 and pageSize=20', async () => {
      repository.find.mockResolvedValue([])

      await sut.findAll({})

      expect(repository.find).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 0, take: 21 }),
      )
    })

    it('should calculate correct skip for page > 1', async () => {
      repository.find.mockResolvedValue([])

      await sut.findAll({ page: 3, pageSize: 10 })

      expect(repository.find).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 20, take: 11 }),
      )
    })

    it('should cap pageSize at 100', async () => {
      repository.find.mockResolvedValue([])

      await sut.findAll({ pageSize: 9999 })

      expect(repository.find).toHaveBeenCalledWith(
        expect.objectContaining({ take: 101 }),
      )
    })
  })

  describe('findById', () => {
    it('should return null when property is not found', async () => {
      repository.findOne.mockResolvedValue(null)

      const result = await sut.findById('property-id')

      expect(result).toBeNull()
    })

    it('should return mapped property when found', async () => {
      repository.findOne.mockResolvedValue(makePropertyRow())

      const result = await sut.findById('property-id')

      expect(result).toMatchObject({
        id: 'property-id',
        name: 'Casa Verde',
        baseRentAmount: 1500,
        status: EPropertyStatus.AVAILABLE,
      })
    })
  })

  describe('update', () => {
    it('should return mapped property on success', async () => {
      repository.findOne.mockResolvedValue(makePropertyRow())
      repository.findOneOrFail.mockResolvedValue(
        makePropertyRow({ name: 'Casa Azul' }),
      )

      const result = await sut.update('property-id', { name: 'Casa Azul' })

      expect(result).toMatchObject({ id: 'property-id', name: 'Casa Azul' })
    })

    it('should return null when the property is not found', async () => {
      repository.findOne.mockResolvedValue(null)

      const result = await sut.update('property-id', { name: 'Casa Azul' })

      expect(result).toBeNull()
    })
  })

  describe('softDelete', () => {
    it('should return true when record is deleted successfully', async () => {
      repository.update.mockResolvedValue({ affected: 1 } as UpdateResult)

      const result = await sut.softDelete('property-id')

      expect(result).toBe(true)
    })

    it('should return false when no property matches', async () => {
      repository.update.mockResolvedValue({ affected: 0 } as UpdateResult)

      const result = await sut.softDelete('property-id')

      expect(result).toBe(false)
    })

    it('should call update with deletedAt set', async () => {
      repository.update.mockResolvedValue({ affected: 1 } as UpdateResult)

      await sut.softDelete('property-id')

      expect(repository.update).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'property-id' }),
        expect.objectContaining({ deletedAt: expect.any(Date) }),
      )
    })
  })
})
