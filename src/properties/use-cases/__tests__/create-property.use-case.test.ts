import { EPropertyStatus } from '@pkg/types'
import type { IPropertiesRepository } from '../../repositories/domain'
import { CreatePropertyUseCase } from '../create-property.use-case'

describe('CreatePropertyUseCase', () => {
  let repository: jest.Mocked<IPropertiesRepository>
  let sut: CreatePropertyUseCase

  const now = new Date('2026-01-01T00:00:00.000Z')
  const property = {
    id: 'property-id',
    rentAmount: 1500,
    solarEnergyActive: false,
    status: EPropertyStatus.AVAILABLE,
    owner: { id: 'owner-id' } as any,
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
    repository.create.mockResolvedValue(property)
    sut = new CreatePropertyUseCase(repository)
  })

  it('should create a property and return it', async () => {
    const input = {
      description: 'bela casa',
      rentAmount: 1500,
      solarEnergyActive: false,
      status: EPropertyStatus.AVAILABLE,
      ownerId: 'owner-id',
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
    expect(result).toBe(property)
  })
})
