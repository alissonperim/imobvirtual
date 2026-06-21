import { Account } from '@pkg/types'
import { ICreateAccountUseCase } from '../domain'
import { CreateAccountInput } from '../../../accounts/domain'
import { IAccountsRepository } from '../../repositories/domain'

export class CreateAccounteUseCase implements ICreateAccountUseCase {
  constructor(private readonly repository: IAccountsRepository) {}
  async execute(params: CreateAccountInput): Promise<Account> {
    const account = await this.repository.create(params)
    return await Promise.resolve(account)
  }
}
