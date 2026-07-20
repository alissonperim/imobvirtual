import { NotFoundException } from '@nestjs/common'
import { EPropertyStatus } from '@pkg/types'
import type { IPropertiesRepository } from '../../repositories/domain'
import { FindPropertyByIdUseCase } from '../find-property-by-id.use-case'

describe('FindPropertyByIdUseCase', () => {
  let repository: jest.Mocked<IPropertiesRepository>
  let sut: FindPropertyByIdUseCase

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
    sut = new FindPropertyByIdUseCase(repository)
  })

  it('should return the property when found', async () => {
    repository.findById.mockResolvedValue(property)

    const result = await sut.execute('property-id')

    expect(repository.findById).toHaveBeenCalledWith('property-id')
    expect(result).toBe(property)
  })

  it('should throw NotFoundException when property does not exist', async () => {
    repository.findById.mockResolvedValue(null)

    await expect(sut.execute('missing-id')).rejects.toThrow(NotFoundException)
  })
})
