import { NotFoundException } from '@nestjs/common'
import { EMaritalStatus, EPropertyStatus } from '@pkg/types'
import type { IPropertiesRepository } from '../../repositories/domain'
import { DeletePropertyUseCase } from '../delete-property.use-case'

describe('DeletePropertyUseCase', () => {
  let repository: jest.Mocked<IPropertiesRepository>
  let sut: DeletePropertyUseCase

  const now = new Date('2026-01-01T00:00:00.000Z')
  const owner = {
    id: 'owner-id',
    name: 'John Doe',
    document: '12345678900',
    phoneNumber: '62999999999',
    maritalStatus: EMaritalStatus.SINGLE,
    accountId: 'account-id',
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
    properties: [],
    createdAt: now,
    updatedAt: now,
  }
  const property = {
    id: 'property-id',
    name: 'Casa Verde',
    baseRentAmount: 1500,
    solarEnergyActive: false,
    status: EPropertyStatus.AVAILABLE,
    owner,
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
    sut = new DeletePropertyUseCase(repository)
  })

  it('should soft-delete the property', async () => {
    repository.softDelete.mockResolvedValue(true)

    await sut.execute(property.id)

    expect(repository.softDelete).toHaveBeenCalledWith(property.id)
    expect(repository.findById).not.toHaveBeenCalled()
  })

  it('should throw NotFoundException when softDelete returns false (record not found)', async () => {
    repository.softDelete.mockResolvedValue(false)

    await expect(sut.execute('missing-id')).rejects.toThrow(NotFoundException)
    expect(repository.softDelete).toHaveBeenCalledWith('missing-id')
  })
})
