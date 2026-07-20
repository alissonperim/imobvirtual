import { EMaritalStatus } from '@pkg/types'
import type { IOwnersRepository } from '../../repositories/domain'
import { CreateOwnerUseCase } from '../create-owner.use-case'

describe('CreateOwnerUseCase', () => {
  let repository: jest.Mocked<IOwnersRepository>
  let sut: CreateOwnerUseCase

  const now = new Date('2026-01-01T00:00:00.000Z')
  const owner = {
    id: 'owner-id',
    name: 'John Doe',
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
    repository.create.mockResolvedValue(owner)
    sut = new CreateOwnerUseCase(repository)
  })

  it('should create an owner and return it', async () => {
    const input = {
      name: 'John Doe',
      lastName: 'Doe',
      document: '12345678900',
      phoneNumber: '62999999999',
      maritalStatus: EMaritalStatus.SINGLE,
      accountId: 'account-id',
      address: {
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
      createdBy: 'placeholder',
    }

    const result = await sut.execute(input)

    expect(repository.create).toHaveBeenCalledWith({
      ...input,
      createdBy: 'fix for while, change later',
    })
    expect(result).toBe(owner)
  })
})
