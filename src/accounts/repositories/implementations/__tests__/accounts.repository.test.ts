import { EAccountRole, EAccountStatus } from '@pkg/types'
import type { Repository } from 'typeorm'
import { AccountsRepository } from '../accounts.repository'
import type {
  AccountEntity,
  PendingRegistrationEntity,
} from '@app/database/entities'

const makeRow = (overrides: Partial<AccountEntity> = {}): AccountEntity =>
  ({
    id: 'account-id',
    role: EAccountRole.OWNER,
    status: EAccountStatus.PENDING,
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
    Pick<Repository<AccountEntity>, 'create' | 'save' | 'findOneByOrFail' | 'find'>
  >
  let pendingRegistrationRepository: Repository<PendingRegistrationEntity>
  let sut: AccountsRepository

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      save: jest.fn(),
      findOneByOrFail: jest.fn(),
      find: jest.fn(),
    }
    pendingRegistrationRepository =
      {} as unknown as Repository<PendingRegistrationEntity>
    sut = new AccountsRepository(
      repository as unknown as Repository<AccountEntity>,
      pendingRegistrationRepository,
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
    })
  })

  describe('list', () => {
    it('should return an empty array when no account is found', async () => {
      repository.find.mockResolvedValue([])

      const result = await sut.list({
        phoneNumber: '62999999999',
        role: EAccountRole.OWNER,
      })

      expect(result).toEqual([])
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
          owner: { phoneNumber: '62999999999' },
        }),
      })
    })

    it('should query by renter phone number and deletedAt filter for RENTER role', async () => {
      repository.find.mockResolvedValue([])

      await sut.list({ phoneNumber: '62999999999', role: EAccountRole.RENTER })

      expect(repository.find).toHaveBeenCalledWith({
        where: expect.objectContaining({
          renter: { phoneNumber: '62999999999' },
        }),
      })
    })
  })

  describe('getById', () => {
    it('should reject when no account is found', async () => {
      repository.findOneByOrFail.mockRejectedValue(new Error('not found'))

      await expect(sut.getById('missing-id')).rejects.toThrow('not found')
    })

    it('should return the mapped account when found', async () => {
      repository.findOneByOrFail.mockResolvedValue(makeRow())

      const result = await sut.getById('account-id')

      expect(result?.id).toBe('account-id')
    })
  })
})
