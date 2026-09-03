import type { EntityTarget, Repository } from 'typeorm'
import { activeManagerStorage } from './implementation/typeorm-transaction-manager'

export function resolveRepository<T extends object>(
  defaultRepository: Repository<T>,
  entity: EntityTarget<T>,
): Repository<T> {
  const activeManager = activeManagerStorage.getStore()

  return activeManager ? activeManager.getRepository(entity) : defaultRepository
}
