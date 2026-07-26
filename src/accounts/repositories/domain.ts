import { Account, PendingRegistrationAccount } from '@pkg/types'
import { CreateAccountInput } from '../domain'
import { GetByDestinationInput } from '../domain/account'
import { CreatePendingRegistrationAccountInput } from '../domain/pending-registration'

export interface IAccountsRepository {
  create(params: CreateAccountInput): Promise<Account>
  createPendingRegistrationUser(
    params: CreatePendingRegistrationAccountInput,
  ): Promise<void>
  list(params: GetByDestinationInput): Promise<Account[] | undefined>
  getById(id: string): Promise<Account | undefined>
  getPendingRegistrationAccount(
    otpId: string,
  ): Promise<PendingRegistrationAccount>
}
