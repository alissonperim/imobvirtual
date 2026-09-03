import type { DataSource, EntityManager } from 'typeorm'
import {
  TypeOrmTransactionManager,
  activeManagerStorage,
} from '../typeorm-transaction-manager'

const fakeManager = {} as EntityManager

const runCallbackWithFakeManager = ((cb: (manager: EntityManager) => unknown) =>
  cb(fakeManager)) as unknown as DataSource['transaction']

describe('TypeOrmTransactionManager', () => {
  let dataSource: jest.Mocked<Pick<DataSource, 'transaction'>>
  let sut: TypeOrmTransactionManager

  beforeEach(() => {
    dataSource = { transaction: jest.fn() }
    sut = new TypeOrmTransactionManager(dataSource as unknown as DataSource)
  })

  it('should open a DataSource transaction and run the work inside it', async () => {
    dataSource.transaction.mockImplementation(runCallbackWithFakeManager)

    const result = await sut.run(async () => 'done')

    expect(dataSource.transaction).toHaveBeenCalledTimes(1)
    expect(result).toBe('done')
  })

  it('should expose the transactional manager to the work callback via activeManagerStorage', async () => {
    dataSource.transaction.mockImplementation(runCallbackWithFakeManager)

    let observedManager: EntityManager | undefined
    await sut.run(async () => {
      observedManager = activeManagerStorage.getStore()
    })

    expect(observedManager).toBe(fakeManager)
  })

  it('should propagate errors thrown inside the work callback', async () => {
    dataSource.transaction.mockImplementation(runCallbackWithFakeManager)

    await expect(
      sut.run(async () => {
        throw new Error('boom')
      }),
    ).rejects.toThrow('boom')
  })
})
