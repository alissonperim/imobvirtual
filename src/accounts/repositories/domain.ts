import { Account } from '@pkg/types'
import { CreateAccountInput, GetByDestinationInput } from '../domain'
import { Pagination } from '@pkg/utils'

export interface IAccountsRepository {
  create(params: CreateAccountInput): Promise<Account>
  getByDestination(params: GetByDestinationInput): Promise<Pagination<Account>>
}
