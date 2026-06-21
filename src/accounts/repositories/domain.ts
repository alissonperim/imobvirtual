import { Account } from '@pkg/types'
import { CreateAccountInput, GetByDestinationInput } from '../domain'

export interface IAccountsRepository {
  create(params: CreateAccountInput): Promise<Account>
  getByDestination(params: GetByDestinationInput): Promise<Account | undefined>
  getById(id: string): Promise<Account | undefined>
}
