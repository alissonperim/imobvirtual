import { EAccountRole, EAccountStatus, EMaritalStatus } from '@pkg/types'
import type { EntityManager, Repository } from 'typeorm'
import { RenterRepository } from '../renter.repository'
import { activeManagerStorage } from '@app/database/transaction/implementation/typeorm-transaction-manager'
import type { RenterEntity } from '@app/database/entities'
import type { CreateRenterRepositoryInput } from '@app/renters/domain'

const makeRenterRow = (overrides: Partial<RenterEntity> = {}): RenterEntity =>
  ({
    id: 'renter-id',
    name: 'John',
    lastName: 'Doe',
    document: '12345678900',
    phoneNumber: '62999999999',
    email: 'john@doe.com',
    maritalStatus: EMaritalStatus.SINGLE,
    accountId: 'account-id',
    address: undefined,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    deletedAt: null,
    createdBy: null,
    updatedBy: null,
    ...overrides,
  }) as RenterEntity

const baseCreateInput: CreateRenterRepositoryInput = {
  name: 'John',
  lastName: 'Doe',
  email: 'john@doe.com',
  phoneNumber: '62999999999',
  account: {
    role: EAccountRole.RENTER,
    otps: [],
  },
}

describe('RenterRepository', () => {
  let repository: jest.Mocked<
    Pick<Repository<RenterEntity>, 'create' | 'save' | 'findOneOrFail'>
  >
  let sut: RenterRepository

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      save: jest.fn(),
      findOneOrFail: jest.fn(),
    }
    sut = new RenterRepository(
      repository as unknown as Repository<RenterEntity>,
    )
  })

  describe('create', () => {
    it('should build the entity with an ACTIVE cascaded account and map the re-fetched row to a Renter', async () => {
      const row = makeRenterRow()
      repository.create.mockReturnValue(row)
      repository.save.mockResolvedValue(row)
      repository.findOneOrFail.mockResolvedValue(row)

      const result = await sut.create(baseCreateInput)

      expect(repository.create).toHaveBeenCalledWith({
        name: baseCreateInput.name,
        lastName: baseCreateInput.lastName,
        email: baseCreateInput.email,
        phoneNumber: baseCreateInput.phoneNumber,
        account: {
          role: baseCreateInput.account.role,
          otps: baseCreateInput.account.otps,
          status: EAccountStatus.ACTIVE,
        },
      })
      expect(result.id).toBe('renter-id')
      expect(result.accountId).toBe('account-id')
    })

    it('should re-fetch the saved row with the address relation before mapping', async () => {
      const row = makeRenterRow()
      repository.create.mockReturnValue(row)
      repository.save.mockResolvedValue(row)
      repository.findOneOrFail.mockResolvedValue(row)

      await sut.create(baseCreateInput)

      expect(repository.findOneOrFail).toHaveBeenCalledWith({
        where: { id: 'renter-id' },
        relations: { address: true },
      })
    })

    it('should use the active transaction manager repository when one is set', async () => {
      const row = makeRenterRow()
      const managedRepository = {
        create: jest.fn().mockReturnValue(row),
        save: jest.fn().mockResolvedValue(row),
        findOneOrFail: jest.fn().mockResolvedValue(row),
      }
      const manager = {
        getRepository: jest.fn().mockReturnValue(managedRepository),
      } as unknown as EntityManager

      await activeManagerStorage.run(manager, () => sut.create(baseCreateInput))

      expect(manager.getRepository).toHaveBeenCalled()
      expect(managedRepository.create).toHaveBeenCalled()
      expect(managedRepository.save).toHaveBeenCalled()
      expect(managedRepository.findOneOrFail).toHaveBeenCalled()
      expect(repository.create).not.toHaveBeenCalled()
    })
  })
})
