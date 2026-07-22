import { EMaritalStatus } from '@pkg/types'
import type { IOwnersRepository } from '../../repositories/domain'
import { FindAllOwnersUseCase } from '../find-all-owners.use-case'

describe('FindAllOwnersUseCase', () => {
  let repository: jest.Mocked<IOwnersRepository>
  let sut: FindAllOwnersUseCase

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
    repository.findAll.mockResolvedValue({ data: [owner], hasMore: false })
    sut = new FindAllOwnersUseCase(repository)
  })

  it('should return paginated owners', async () => {
    const result = await sut.execute({ page: 1, pageSize: 20 })

    expect(repository.findAll).toHaveBeenCalledWith({ page: 1, pageSize: 20 })
    expect(result.data).toHaveLength(1)
    expect(result.hasMore).toBe(false)
  })

  it('should pass filters to the repository', async () => {
    await sut.execute({ page: 2, pageSize: 10 })

    expect(repository.findAll).toHaveBeenCalledWith({ page: 2, pageSize: 10 })
  })
})
