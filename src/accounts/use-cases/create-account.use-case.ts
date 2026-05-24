import { Account, EAccountRole, EAccountStatus } from '@pkg/types'
import { randomUUID } from 'crypto'

export type CreateAccountInput = {
  email?: string
  phoneNumber?: string
  role: EAccountRole
  status: EAccountStatus
}

export interface ICreateAccountUseCase {
  execute(params: CreateAccountInput): Promise<Account>
}

export class CreateAccounteUseCase implements ICreateAccountUseCase {
  async execute(params: CreateAccountInput): Promise<Account> {
    const account: Account = {
      id: randomUUID(),
      role: params.role,
      status: params.status,
      email: params.email,
      phoneNumber: params.phoneNumber,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    return await Promise.resolve(account)
  }
}
