import { NotFoundException } from '@nestjs/common'
import { EMaritalStatus } from '@pkg/types'
import type { IOwnersRepository } from '../../repositories/domain'
import { FindOwnerByIdUseCase } from '../find-owner-by-id.use-case'

describe('FindOwnerByIdUseCase', () => {
  let repository: jest.Mocked<IOwnersRepository>
  let sut: FindOwnerByIdUseCase

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
    sut = new FindOwnerByIdUseCase(repository)
  })

  it('should return the owner when found', async () => {
    repository.findById.mockResolvedValue(owner)

    const result = await sut.execute('owner-id')

    expect(repository.findById).toHaveBeenCalledWith('owner-id')
    expect(result).toBe(owner)
  })

  it('should throw NotFoundException when owner is not found', async () => {
    repository.findById.mockResolvedValue(null)

    await expect(sut.execute('missing-id')).rejects.toThrow(NotFoundException)
  })
})
