import { EPropertyStatus } from '@pkg/types'
import type { IPropertiesRepository } from '../../repositories/domain'
import { FindAllPropertiesUseCase } from '../find-all-properties.use-case'

describe('FindAllPropertiesUseCase', () => {
  let repository: jest.Mocked<IPropertiesRepository>
  let sut: FindAllPropertiesUseCase

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
    repository.findAll.mockResolvedValue({ data: [property], hasMore: false })
    sut = new FindAllPropertiesUseCase(repository)
  })

  it('should return paginated properties', async () => {
    const result = await sut.execute({ page: 1, pageSize: 20 })

    expect(repository.findAll).toHaveBeenCalledWith({ page: 1, pageSize: 20 })
    expect(result.data).toHaveLength(1)
    expect(result.hasMore).toBe(false)
  })

  it('should pass filters to the repository', async () => {
    await sut.execute({ ownerId: 'owner-id', status: EPropertyStatus.AVAILABLE })

    expect(repository.findAll).toHaveBeenCalledWith({
      ownerId: 'owner-id',
      status: EPropertyStatus.AVAILABLE,
    })
  })
})
