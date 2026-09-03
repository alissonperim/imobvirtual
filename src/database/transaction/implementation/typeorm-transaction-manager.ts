import { AsyncLocalStorage } from 'node:async_hooks'
import { Injectable } from '@nestjs/common'
import { InjectDataSource } from '@nestjs/typeorm'
import { DataSource, EntityManager } from 'typeorm'
import type { ITransactionManager } from '../domain'

export const activeManagerStorage = new AsyncLocalStorage<EntityManager>()

@Injectable()
export class TypeOrmTransactionManager implements ITransactionManager {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async run<T>(work: () => Promise<T>): Promise<T> {
    return this.dataSource.transaction((manager) =>
      activeManagerStorage.run(manager, work),
    )
  }
}
