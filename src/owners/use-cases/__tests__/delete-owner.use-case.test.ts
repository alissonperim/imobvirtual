import { NotFoundException } from '@nestjs/common'
import type { IOwnersRepository } from '../../repositories/domain'
import { DeleteOwnerUseCase } from '../delete-owner.use-case'

describe('DeleteOwnerUseCase', () => {
  let repository: jest.Mocked<IOwnersRepository>
  let sut: DeleteOwnerUseCase

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
    }
    sut = new DeleteOwnerUseCase(repository)
  })

  it('should soft-delete the owner successfully', async () => {
    repository.softDelete.mockResolvedValue(true)

    await expect(sut.execute('owner-id')).resolves.toBeUndefined()
    expect(repository.softDelete).toHaveBeenCalledWith('owner-id')
  })

  it('should throw NotFoundException when owner is not found', async () => {
    repository.softDelete.mockResolvedValue(false)

    await expect(sut.execute('missing-id')).rejects.toThrow(NotFoundException)
    expect(repository.softDelete).toHaveBeenCalledWith('missing-id')
  })
})
