import { EMaritalStatus } from '@pkg/types'
import type { PrismaService } from '@app/prisma/prisma.service'
import { OwnersRepository } from '../owners.repository'
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

const makeP2025 = () =>
  new Prisma.PrismaClientKnownRequestError('Record to update not found.', {
    code: 'P2025',
    clientVersion: '5.0.0',
  })

const baseInput = {
  name: 'John Doe',
  document: '12345678900',
  phoneNumber: '62999999999',
  maritalStatus: EMaritalStatus.SINGLE,
  accountId: 'account-id',
  addressId: 'addr-id',
}

describe('OwnersRepository', () => {
  let prisma: { owner: Record<string, jest.Mock> }
  let sut: OwnersRepository

  beforeEach(() => {
    prisma = {
      owner: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
    }
    sut = new OwnersRepository(prisma as unknown as PrismaService)
  })

  describe('create', () => {
    it('should map the created row to an Owner domain object', async () => {
      prisma.owner.create.mockResolvedValue(makeOwnerRow())

      const result = await sut.create(baseInput)

      expect(result.id).toBe('owner-id')
      expect(result.name).toBe('John Doe')
      expect(result.maritalStatus).toBe(EMaritalStatus.SINGLE)
      expect(result.properties).toEqual([])
    })

    it('should map null email to undefined', async () => {
      prisma.owner.create.mockResolvedValue(makeOwnerRow({ email: null }))

      const result = await sut.create(baseInput)

      expect(result.email).toBeUndefined()
    })

    it('should map email when present', async () => {
      prisma.owner.create.mockResolvedValue(
        makeOwnerRow({ email: 'john@example.com' }),
      )

      const result = await sut.create(baseInput)

      expect(result.email).toBe('john@example.com')
    })

    it('should map null address nullable fields to undefined', async () => {
      prisma.owner.create.mockResolvedValue(
        makeOwnerRow({
          address: makeAddressRow({ deletedAt: null, createdBy: null }),
        }),
      )

      const result = await sut.create(baseInput)

      expect(result.address.deletedAt).toBeUndefined()
      expect(result.address.createdBy).toBeUndefined()
    })
  })

  describe('findAll', () => {
    it('should return paginated owners with hasMore false when results fit one page', async () => {
      prisma.owner.findMany.mockResolvedValue([makeOwnerRow()])

      const result = await sut.findAll({ page: 1, pageSize: 20 })

      expect(result.data).toHaveLength(1)
      expect(result.hasMore).toBe(false)
    })

    it('should set hasMore true and trim last row when results exceed pageSize', async () => {
      const rows = Array.from({ length: 3 }, (_, i) =>
        makeOwnerRow({ id: `owner-${i}` }),
      )
      prisma.owner.findMany.mockResolvedValue(rows)

      const result = await sut.findAll({ page: 1, pageSize: 2 })

      expect(result.data).toHaveLength(2)
      expect(result.hasMore).toBe(true)
    })

    it('should call findMany with correct skip for page 2', async () => {
      prisma.owner.findMany.mockResolvedValue([])

      await sut.findAll({ page: 2, pageSize: 10 })

      expect(prisma.owner.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 10, take: 11 }),
      )
    })

    it('should filter soft-deleted owners', async () => {
      prisma.owner.findMany.mockResolvedValue([])

      await sut.findAll({})

      expect(prisma.owner.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ deletedAt: null }),
        }),
      )
    })
  })

  describe('findById', () => {
    it('should return the mapped owner when found', async () => {
      prisma.owner.findFirst.mockResolvedValue(makeOwnerRow())

      const result = await sut.findById('owner-id')

      expect(result?.id).toBe('owner-id')
    })

    it('should return null when owner is not found', async () => {
      prisma.owner.findFirst.mockResolvedValue(null)

      const result = await sut.findById('missing-id')

      expect(result).toBeNull()
    })

    it('should query with deletedAt null', async () => {
      prisma.owner.findFirst.mockResolvedValue(null)

      await sut.findById('owner-id')

      expect(prisma.owner.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ id: 'owner-id', deletedAt: null }),
        }),
      )
    })
  })

  describe('update', () => {
    it('should return the mapped updated owner', async () => {
      prisma.owner.update.mockResolvedValue(makeOwnerRow({ name: 'Jane Doe' }))

      const result = await sut.update('owner-id', { name: 'Jane Doe' })

      expect(result?.name).toBe('Jane Doe')
    })

    it('should return null on P2025 (record not found)', async () => {
      prisma.owner.update.mockRejectedValue(makeP2025())

      const result = await sut.update('missing-id', { name: 'Jane Doe' })

      expect(result).toBeNull()
    })

    it('should rethrow unexpected errors', async () => {
      const unexpectedError = new Error('database connection failed')
      prisma.owner.update.mockRejectedValue(unexpectedError)

      await expect(
        sut.update('owner-id', { name: 'Jane Doe' }),
      ).rejects.toThrow('database connection failed')
    })

    it('should call update with where deletedAt null', async () => {
      prisma.owner.update.mockResolvedValue(makeOwnerRow())

      await sut.update('owner-id', { name: 'Jane Doe' })

      expect(prisma.owner.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ id: 'owner-id', deletedAt: null }),
        }),
      )
    })
  })

  describe('softDelete', () => {
    it('should return true when owner is deleted', async () => {
      prisma.owner.update.mockResolvedValue(makeOwnerRow())

      const result = await sut.softDelete('owner-id')

      expect(result).toBe(true)
    })

    it('should return false on P2025 (record not found)', async () => {
      prisma.owner.update.mockRejectedValue(makeP2025())

      const result = await sut.softDelete('missing-id')

      expect(result).toBe(false)
    })

    it('should rethrow unexpected errors', async () => {
      prisma.owner.update.mockRejectedValue(new Error('db error'))

      await expect(sut.softDelete('owner-id')).rejects.toThrow('db error')
    })

    it('should call update with deletedAt set', async () => {
      prisma.owner.update.mockResolvedValue(makeOwnerRow())

      await sut.softDelete('owner-id')

      expect(prisma.owner.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ id: 'owner-id', deletedAt: null }),
          data: expect.objectContaining({ deletedAt: expect.any(Date) }),
        }),
      )
    })
  })
})
