import { Account } from '@pkg/types'
import { CreateAccountInput } from '../domain'
import { GetByDestinationInput } from '../domain/account'

export interface IAccountsRepository {
  create(params: CreateAccountInput): Promise<Account>
  list(params: GetByDestinationInput): Promise<Account[] | undefined>
  getById(id: string): Promise<Account | undefined>
}
