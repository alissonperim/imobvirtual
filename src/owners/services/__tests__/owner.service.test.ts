import { EAccountRole, EMaritalStatus } from '@pkg/types'
import type { IOwnersRepository } from '../../repositories/domain'
import type { RegisterOwnerInput } from '../../domain/owner'
import { OwnerService } from '../owner.service'

describe('OwnerService', () => {
  let repository: jest.Mocked<IOwnersRepository>
  let sut: OwnerService

  const now = new Date('2026-01-01T00:00:00.000Z')
  const owner = {
    id: 'owner-id',
    name: 'John',
    lastName: 'Doe',
    document: '12345678900',
    phoneNumber: '62999999999',
    maritalStatus: EMaritalStatus.SINGLE,
    accountId: 'account-id',
    properties: [],
    address: {
      id: 'addr-id',
      street: 'Rua A',
      neighborhood: 'Centro',
      postalCode: '74000-000',
      complement: 'Apto 1',
      city: 'Goiânia',
      state: 'GO',
      number: '100',
      createdAt: now,
      updatedAt: now,
    },
    createdAt: now,
    updatedAt: now,
  }

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
    }
    sut = new OwnerService(repository)
  })

  describe('register', () => {
    it('should create an owner and return it', async () => {
      repository.create.mockResolvedValue(owner)

      const input: RegisterOwnerInput = {
        name: 'John',
        lastName: 'Doe',
        phoneNumber: '62999999999',
        email: 'john@doe.com',
        account: {
          role: EAccountRole.OWNER,
          otps: [],
        },
      }

      const result = await sut.register(input)

      expect(repository.create).toHaveBeenCalledWith({
        ...input,
        createdBy: 'fix for while, change later',
      })
      expect(result).toBe(owner)
    })
  })
})
