import type { EntityManager, EntityTarget, Repository } from 'typeorm'
import { resolveRepository } from '../resolve-repository'
import { activeManagerStorage } from '../implementation/typeorm-transaction-manager'

class FakeEntity {}

describe('resolveRepository', () => {
  const defaultRepository = {
    name: 'default',
  } as unknown as Repository<FakeEntity>
  const entity = FakeEntity as EntityTarget<FakeEntity>

  it('should return the default repository when there is no active transaction', () => {
    const result = resolveRepository(defaultRepository, entity)

    expect(result).toBe(defaultRepository)
  })

  it("should return the active manager's repository when a transaction is running", async () => {
    const managedRepository = {
      name: 'managed',
    } as unknown as Repository<FakeEntity>
    const manager = {
      getRepository: jest.fn().mockReturnValue(managedRepository),
    } as unknown as EntityManager

    const result = await activeManagerStorage.run(manager, () =>
      Promise.resolve(resolveRepository(defaultRepository, entity)),
    )

    expect(manager.getRepository).toHaveBeenCalledWith(entity)
    expect(result).toBe(managedRepository)
  })
})
