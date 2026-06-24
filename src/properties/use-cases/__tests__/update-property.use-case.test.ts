import { NotFoundException } from '@nestjs/common'
import { EMaritalStatus, EPropertyStatus } from '@pkg/types'
import type { IPropertiesRepository } from '../../repositories/domain'
import { UpdatePropertyUseCase } from '../update-property.use-case'

describe('UpdatePropertyUseCase', () => {
  let repository: jest.Mocked<IPropertiesRepository>
  let sut: UpdatePropertyUseCase

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
  const updatedProperty = { ...property, name: 'Casa Azul', updatedAt: new Date() }

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
    }
    sut = new UpdatePropertyUseCase(repository)
  })

  it('should update and return the property', async () => {
    repository.update.mockResolvedValue(updatedProperty)

    const result = await sut.execute('property-id', { name: 'Casa Azul', updatedBy: 'account-id' })

    expect(repository.update).toHaveBeenCalledWith('property-id', {
      name: 'Casa Azul',
      updatedBy: 'account-id',
    })
    expect(repository.findById).not.toHaveBeenCalled()
    expect(result).toBe(updatedProperty)
  })

  it('should throw NotFoundException when update returns null (record not found)', async () => {
    repository.update.mockResolvedValue(null)

    await expect(sut.execute('missing-id', { name: 'Casa Azul' })).rejects.toThrow(NotFoundException)
    expect(repository.update).toHaveBeenCalledWith('missing-id', { name: 'Casa Azul' })
  })
})
