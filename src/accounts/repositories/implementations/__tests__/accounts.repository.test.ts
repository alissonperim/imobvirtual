import { EAccountRole, EAccountStatus } from '@pkg/types'
import type { Repository } from 'typeorm'
import { AccountsRepository } from '../accounts.repository'
import type { AccountEntity } from '@app/database/entities'

const makeRow = (overrides: Partial<AccountEntity> = {}): AccountEntity =>
  ({
    id: 'account-id',
    role: EAccountRole.OWNER,
    status: EAccountStatus.PENDING,
    lastLoginAt: null,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    deletedAt: null,
    createdBy: null,
    updatedBy: null,
    deletedBy: null,
    ...overrides,
  }) as AccountEntity

describe('AccountsRepository', () => {
  let repository: jest.Mocked<
    Pick<Repository<AccountEntity>, 'create' | 'save' | 'findOne' | 'find'>
  >
  let sut: AccountsRepository

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
    }
    sut = new AccountsRepository(
      repository as unknown as Repository<AccountEntity>,
    )
  })

  describe('create', () => {
    it('should map the saved row to an Account domain object', async () => {
      repository.create.mockReturnValue(makeRow())
      repository.save.mockResolvedValue(makeRow())

      const result = await sut.create({
        role: EAccountRole.OWNER,
        status: EAccountStatus.PENDING,
      })

      expect(repository.create).toHaveBeenCalledWith({
        role: EAccountRole.OWNER,
        status: EAccountStatus.PENDING,
      })
      expect(result.id).toBe('account-id')
      expect(result.lastLoginAt).toBeUndefined()
    })
  })

  describe('list', () => {
    it('should return undefined when no account is found', async () => {
      repository.find.mockResolvedValue([])

      const result = await sut.list({
        phoneNumber: '62999999999',
        role: EAccountRole.OWNER,
      })

      expect(result).toBeUndefined()
    })

    it('should return the mapped accounts when found', async () => {
      repository.find.mockResolvedValue([makeRow()])

      const result = await sut.list({
        phoneNumber: '62999999999',
        role: EAccountRole.OWNER,
      })

      expect(result?.[0]?.id).toBe('account-id')
    })

    it('should query by owner phone number and deletedAt filter for OWNER role', async () => {
      repository.find.mockResolvedValue([])

      await sut.list({ phoneNumber: '62999999999', role: EAccountRole.OWNER })

      expect(repository.find).toHaveBeenCalledWith({
        where: expect.objectContaining({
          owner: { phoneNumner: '62999999999' },
        }),
      })
    })

    it('should query by renter phone number and deletedAt filter for RENTER role', async () => {
      repository.find.mockResolvedValue([])

      await sut.list({ phoneNumber: '62999999999', role: EAccountRole.RENTER })

      expect(repository.find).toHaveBeenCalledWith({
        where: expect.objectContaining({
          renter: { phoneNumner: '62999999999' },
        }),
      })
    })
  })

  describe('getById', () => {
    it('should return undefined when no account is found', async () => {
      repository.findOne.mockResolvedValue(null)

      const result = await sut.getById('missing-id')

      expect(result).toBeUndefined()
    })

    it('should return the mapped account when found', async () => {
      repository.findOne.mockResolvedValue(makeRow())

      const result = await sut.getById('account-id')

      expect(result?.id).toBe('account-id')
    })
  })
})
