import { EPropertyStatus } from '@pkg/types'
import type { IPropertiesRepository } from '../../repositories/domain'
import { CreatePropertyUseCase } from '../create-property.use-case'

describe('CreatePropertyUseCase', () => {
  let repository: jest.Mocked<IPropertiesRepository>
  let sut: CreatePropertyUseCase

  const now = new Date('2026-01-01T00:00:00.000Z')
  const property = {
    id: 'property-id',
    name: 'Casa Verde',
    baseRentAmount: 1500,
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
      name: 'Casa Verde',
      baseRentAmount: 1500,
      solarEnergyActive: false,
      status: EPropertyStatus.AVAILABLE,
      ownerId: 'owner-id',
      createdBy: 'account-id',
    }

    const result = await sut.execute(input)

    expect(repository.create).toHaveBeenCalledWith(input)
    expect(result).toBe(property)
  })
})
