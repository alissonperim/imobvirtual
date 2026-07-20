import { NotFoundException } from '@nestjs/common'
import { EMaritalStatus } from '@pkg/types'
import type { IOwnersRepository } from '../../repositories/domain'
import { UpdateOwnerUseCase } from '../update-owner.use-case'

describe('UpdateOwnerUseCase', () => {
  let repository: jest.Mocked<IOwnersRepository>
  let sut: UpdateOwnerUseCase

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
  const updatedOwner = {
    ...owner,
    maritalStatus: EMaritalStatus.MARIED,
    updatedAt: new Date(),
  }

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
    }
    sut = new UpdateOwnerUseCase(repository)
  })

  it('should update and return the owner', async () => {
    repository.update.mockResolvedValue(updatedOwner)

    const result = await sut.execute('owner-id', {
      maritalStatus: EMaritalStatus.MARIED,
      updatedBy: 'placeholder',
    })

    expect(repository.update).toHaveBeenCalledWith('owner-id', {
      maritalStatus: EMaritalStatus.MARIED,
      updatedBy: 'fix for while, change later',
    })
    expect(result).toBe(updatedOwner)
  })

  it('should throw NotFoundException when update returns null (record not found)', async () => {
    repository.update.mockResolvedValue(null)

    await expect(
      sut.execute('missing-id', {
        maritalStatus: EMaritalStatus.MARIED,
        updatedBy: 'placeholder',
      }),
    ).rejects.toThrow(NotFoundException)
    expect(repository.update).toHaveBeenCalledWith('missing-id', {
      maritalStatus: EMaritalStatus.MARIED,
      updatedBy: 'fix for while, change later',
    })
  })
})
