import { Account } from '@pkg/types'
import { IAccountsRepository } from '../domain'
import { randomUUID } from 'node:crypto'
import { CreateAccountInput, GetByDestinationInput } from 'src/accounts/domain'

export class AccountsRepository implements IAccountsRepository {
  private readonly accounts: Account[] = []
  async create(params: CreateAccountInput): Promise<Account> {
    const account: Account = {
      id: randomUUID(),
      role: params.role,
      status: params.status,
      phoneNumber: params.phoneNumber,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    this.accounts.push(account)

    return await Promise.resolve(account)
  }

  async getByDestination(
    params: GetByDestinationInput,
  ): Promise<Account | undefined> {
    const account = this.accounts.find((t) => {
      return t.phoneNumber === params.phoneNumber
    })

    return Promise.resolve(account)
  }

  async getById(id: string): Promise<Account | undefined> {
    const account = this.accounts.find((acc) => acc.id === id)

    return account
  }
}
