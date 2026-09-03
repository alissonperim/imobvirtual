import { EAccountRole, EAccountStatus } from '@pkg/types'
import type { EntityManager, Repository } from 'typeorm'
import { AccountsRepository } from '../accounts.repository'
import { activeManagerStorage } from '@app/database/transaction/implementation/typeorm-transaction-manager'
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

const makePendingRegistrationRow = (
  overrides: Partial<PendingRegistrationEntity> = {},
): PendingRegistrationEntity =>
  ({
    id: 'pending-id',
    email: 'john@doe.com',
    phoneNumber: '62999999999',
    name: 'John',
    lastName: 'Doe',
    role: EAccountRole.OWNER,
    otpId: 'otp-id',
    ...overrides,
  }) as PendingRegistrationEntity

describe('AccountsRepository', () => {
  let repository: jest.Mocked<
    Pick<
      Repository<AccountEntity>,
      'create' | 'save' | 'findOneByOrFail' | 'find'
    >
  >
  let pendingRegistrationRepository: jest.Mocked<
    Pick<
      Repository<PendingRegistrationEntity>,
      'create' | 'save' | 'findOne' | 'update' | 'delete'
    >
  >
  let sut: AccountsRepository

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      save: jest.fn(),
      findOneByOrFail: jest.fn(),
      find: jest.fn(),
    }
    pendingRegistrationRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    }
    sut = new AccountsRepository(
      repository as unknown as Repository<AccountEntity>,
      pendingRegistrationRepository as unknown as Repository<PendingRegistrationEntity>,
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

  describe('createPendingRegistrationUser', () => {
    const params = {
      email: 'john@doe.com',
      phoneNumber: '62999999999',
      name: 'John',
      lastName: 'Doe',
      role: EAccountRole.OWNER,
      otpId: 'new-otp-id',
    }

    it('should insert a new row when none exists for that email/phoneNumber+role', async () => {
      pendingRegistrationRepository.findOne.mockResolvedValue(null)
      const created = makePendingRegistrationRow()
      pendingRegistrationRepository.create.mockReturnValue(created)
      pendingRegistrationRepository.save.mockResolvedValue(created)

      await sut.createPendingRegistrationUser(params)

      expect(pendingRegistrationRepository.findOne).toHaveBeenCalledWith({
        where: [
          { email: params.email, role: params.role },
          { phoneNumber: params.phoneNumber, role: params.role },
        ],
      })
      expect(pendingRegistrationRepository.create).toHaveBeenCalledWith(params)
      expect(pendingRegistrationRepository.save).toHaveBeenCalledWith(created)
      expect(pendingRegistrationRepository.update).not.toHaveBeenCalled()
    })

    it('should update the existing row (retry after an abandoned/expired attempt) instead of inserting a duplicate', async () => {
      const existing = makePendingRegistrationRow({ id: 'pending-id' })
      pendingRegistrationRepository.findOne.mockResolvedValue(existing)

      await sut.createPendingRegistrationUser(params)

      expect(pendingRegistrationRepository.update).toHaveBeenCalledWith(
        { id: existing.id },
        {
          email: params.email,
          phoneNumber: params.phoneNumber,
          name: params.name,
          lastName: params.lastName,
          otpId: params.otpId,
        },
      )
      expect(pendingRegistrationRepository.create).not.toHaveBeenCalled()
      expect(pendingRegistrationRepository.save).not.toHaveBeenCalled()
    })
  })

  describe('deletePendingRegistrationUser', () => {
    it('should delete by otpId using the default repository when there is no active transaction', async () => {
      await sut.deletePendingRegistrationUser('otp-id')

      expect(pendingRegistrationRepository.delete).toHaveBeenCalledWith({
        otpId: 'otp-id',
      })
    })

    it('should delete through the active transaction manager when one is set', async () => {
      const managedDelete = jest.fn()
      const manager = {
        getRepository: jest.fn().mockReturnValue({ delete: managedDelete }),
      } as unknown as EntityManager

      await activeManagerStorage.run(manager, () =>
        sut.deletePendingRegistrationUser('otp-id'),
      )

      expect(managedDelete).toHaveBeenCalledWith({ otpId: 'otp-id' })
      expect(pendingRegistrationRepository.delete).not.toHaveBeenCalled()
    })
  })
})
