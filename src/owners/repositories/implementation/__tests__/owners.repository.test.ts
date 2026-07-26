import { EMaritalStatus } from '@pkg/types'
import type { Repository, UpdateResult } from 'typeorm'
import { OwnersRepository } from '../owners.repository'
import type { AddressEntity, OwnerEntity } from '@app/database/entities'
import type { CreateOwnerInput } from '../../../domain/owner'

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

const baseAddressInput = {
  street: 'Rua A',
  neighborhood: 'Centro',
  postalCode: '74000-000',
  complement: 'Apto 1',
  city: 'Goiânia',
  state: 'GO',
  number: '100',
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
}

const baseCreateInput: CreateOwnerInput = {
  name: 'John Doe',
  lastName: 'Doe',
  phoneNumber: '62999999999',
  email: 'john@example.com',
  createdBy: 'account-id',
}

describe('OwnersRepository', () => {
  let repository: jest.Mocked<
    Pick<
      Repository<OwnerEntity>,
      'create' | 'save' | 'find' | 'findOne' | 'findOneOrFail' | 'update'
    >
  >
  let sut: OwnersRepository

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      findOneOrFail: jest.fn(),
      update: jest.fn(),
    }
    sut = new OwnersRepository(repository as unknown as Repository<OwnerEntity>)
  })

  describe('create', () => {
    it('should map the created row to an Owner domain object', async () => {
      const row = makeOwnerRow()
      repository.create.mockReturnValue(row)
      repository.save.mockResolvedValue(row)
      repository.findOneOrFail.mockResolvedValue(row)

      const result = await sut.create(baseCreateInput)

      expect(result.id).toBe('owner-id')
      expect(result.name).toBe('John Doe')
      expect(result.maritalStatus).toBe(EMaritalStatus.SINGLE)
      expect(result.properties).toEqual([])
    })

    it('should map null email to undefined', async () => {
      const row = makeOwnerRow({ email: null })
      repository.create.mockReturnValue(row)
      repository.save.mockResolvedValue(row)
      repository.findOneOrFail.mockResolvedValue(row)

      const result = await sut.create(baseCreateInput)

      expect(result.email).toBeUndefined()
    })

    it('should map email when present', async () => {
      const row = makeOwnerRow({ email: 'john@example.com' })
      repository.create.mockReturnValue(row)
      repository.save.mockResolvedValue(row)
      repository.findOneOrFail.mockResolvedValue(row)

      const result = await sut.create(baseCreateInput)

      expect(result.email).toBe('john@example.com')
    })

    it('should map null address nullable fields to undefined', async () => {
      const row = makeOwnerRow({
        address: makeAddressRow({
          deletedAt: null,
          createdBy: null,
        } as unknown as Partial<AddressEntity>),
      })
      repository.create.mockReturnValue(row)
      repository.save.mockResolvedValue(row)
      repository.findOneOrFail.mockResolvedValue(row)

      const result = await sut.create(baseCreateInput)

      expect(result.address.deletedAt).toBeUndefined()
      expect(result.address.createdBy).toBeUndefined()
    })

    it('should build the entity from the create input', async () => {
      const row = makeOwnerRow()
      repository.create.mockReturnValue(row)
      repository.save.mockResolvedValue(row)
      repository.findOneOrFail.mockResolvedValue(row)

      await sut.create(baseCreateInput)

      expect(repository.create).toHaveBeenCalledWith({
        name: baseCreateInput.name,
        lastName: baseCreateInput.lastName,
        phoneNumber: baseCreateInput.phoneNumber,
        email: baseCreateInput.email,
      })
    })

    it('should re-fetch the saved row with the address relation before mapping', async () => {
      const row = makeOwnerRow()
      repository.create.mockReturnValue(row)
      repository.save.mockResolvedValue(row)
      repository.findOneOrFail.mockResolvedValue(row)

      await sut.create(baseCreateInput)

      expect(repository.findOneOrFail).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'owner-id' },
          relations: { address: true },
        }),
      )
    })
  })

  describe('findAll', () => {
    it('should return paginated owners with hasMore false when results fit one page', async () => {
      repository.find.mockResolvedValue([makeOwnerRow()])

      const result = await sut.findAll({ page: 1, pageSize: 20 })

      expect(result.data).toHaveLength(1)
      expect(result.hasMore).toBe(false)
    })

    it('should set hasMore true and trim last row when results exceed pageSize', async () => {
      const rows = Array.from({ length: 3 }, (_, i) =>
        makeOwnerRow({ id: `owner-${i}` }),
      )
      repository.find.mockResolvedValue(rows)

      const result = await sut.findAll({ page: 1, pageSize: 2 })

      expect(result.data).toHaveLength(2)
      expect(result.hasMore).toBe(true)
    })

    it('should call find with correct skip for page 2', async () => {
      repository.find.mockResolvedValue([])

      await sut.findAll({ page: 2, pageSize: 10 })

      expect(repository.find).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 10, take: 11 }),
      )
    })

    it('should filter soft-deleted owners', async () => {
      repository.find.mockResolvedValue([])

      await sut.findAll({})

      expect(repository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ deletedAt: expect.anything() }),
        }),
      )
    })
  })

  describe('findById', () => {
    it('should return the mapped owner when found', async () => {
      repository.findOne.mockResolvedValue(makeOwnerRow())

      const result = await sut.findById('owner-id')

      expect(result?.id).toBe('owner-id')
    })

    it('should return null when owner is not found', async () => {
      repository.findOne.mockResolvedValue(null)

      const result = await sut.findById('missing-id')

      expect(result).toBeNull()
    })
  })

  describe('update', () => {
    it('should return the mapped updated owner', async () => {
      repository.findOne.mockResolvedValue(makeOwnerRow())
      repository.findOneOrFail.mockResolvedValue(
        makeOwnerRow({ maritalStatus: EMaritalStatus.MARIED }),
      )

      const result = await sut.update('owner-id', {
        maritalStatus: EMaritalStatus.MARIED,
        updatedBy: 'account-id',
      })

      expect(result?.maritalStatus).toBe(EMaritalStatus.MARIED)
    })

    it('should return null when owner is not found', async () => {
      repository.findOne.mockResolvedValue(null)

      const result = await sut.update('missing-id', {
        maritalStatus: EMaritalStatus.MARIED,
        updatedBy: 'account-id',
      })

      expect(result).toBeNull()
    })

    it('should cascade the address using the existing addressId, not the owner id', async () => {
      const existing = makeOwnerRow({ id: 'owner-id', addressId: 'addr-id' })
      repository.findOne.mockResolvedValue(existing)
      repository.findOneOrFail.mockResolvedValue(makeOwnerRow())

      await sut.update('owner-id', {
        address: { ...baseAddressInput, street: 'Rua Nova' },
        updatedBy: 'account-id',
      })

      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          address: expect.objectContaining({
            id: 'addr-id',
            street: 'Rua Nova',
          }),
        }),
      )
    })

    it('should not touch the address when it is not part of the update payload', async () => {
      const existing = makeOwnerRow({ id: 'owner-id' })
      repository.findOne.mockResolvedValue(existing)
      repository.findOneOrFail.mockResolvedValue(makeOwnerRow())

      await sut.update('owner-id', {
        maritalStatus: EMaritalStatus.DIVORCED,
        updatedBy: 'account-id',
      })

      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({ address: undefined }),
      )
    })
  })

  describe('softDelete', () => {
    it('should return true when owner is deleted', async () => {
      repository.update.mockResolvedValue({ affected: 1 } as UpdateResult)

      const result = await sut.softDelete('owner-id')

      expect(result).toBe(true)
    })

    it('should return false when no owner matches', async () => {
      repository.update.mockResolvedValue({ affected: 0 } as UpdateResult)

      const result = await sut.softDelete('missing-id')

      expect(result).toBe(false)
    })

    it('should call update with deletedAt set', async () => {
      repository.update.mockResolvedValue({ affected: 1 } as UpdateResult)

      await sut.softDelete('owner-id')

      expect(repository.update).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'owner-id' }),
        expect.objectContaining({ deletedAt: expect.any(Date) }),
      )
    })
  })
})
