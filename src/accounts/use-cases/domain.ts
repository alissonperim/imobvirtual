import { Account } from '@pkg/types'
import { CreateAccountInput } from '../domain'

export interface ICreateAccountUseCase {
  execute(params: CreateAccountInput): Promise<Account>
}
