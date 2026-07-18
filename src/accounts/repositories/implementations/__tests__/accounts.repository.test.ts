import { EAccountRole, EAccountStatus } from '@pkg/types'
import type { Repository } from 'typeorm'
import { AccountsRepository } from '../accounts.repository'
import type { AccountEntity } from '@app/database/entities'

const makeRow = (overrides: Partial<AccountEntity> = {}): AccountEntity =>
  ({
    id: 'account-id',
    phoneNumber: '62999999999',
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
    Pick<Repository<AccountEntity>, 'create' | 'save' | 'findOne'>
  >
  let sut: AccountsRepository

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
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
        phoneNumber: '62999999999',
        role: EAccountRole.OWNER,
        status: EAccountStatus.PENDING,
        name: 'John Doe',
      })

      expect(result.id).toBe('account-id')
      expect(result.phoneNumber).toBe('62999999999')
      expect(result.lastLoginAt).toBeUndefined()
    })
  })

  describe('getByDestination', () => {
    it('should return undefined when no account is found', async () => {
      repository.findOne.mockResolvedValue(null)

      const result = await sut.getByDestination({ phoneNumber: '62999999999' })

      expect(result).toBeUndefined()
    })

    it('should return the mapped account when found', async () => {
      repository.findOne.mockResolvedValue(makeRow())

      const result = await sut.getByDestination({ phoneNumber: '62999999999' })

      expect(result?.id).toBe('account-id')
    })

    it('should query with phoneNumber and deletedAt filter', async () => {
      repository.findOne.mockResolvedValue(null)

      await sut.getByDestination({ phoneNumber: '62999999999' })

      expect(repository.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ phoneNumber: '62999999999' }),
        }),
      )
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
