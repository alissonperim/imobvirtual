import { Account, EAccountRole, PendingRegistrationAccount } from '@pkg/types'
import {
  GetAccountInput,
  RegisterAccountInput,
  RegisterAccountOutput,
} from '../domain/account'
import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common'
import { RenterService } from '@app/renters/services/renter.service'
import { OwnerService } from '@app/owners/services/owner.service'
import { AccountsRepository } from '../repositories/implementations/accounts.repository'
import { CreatePendingRegistrationAccountInput } from '../domain'

export interface IAccountService {
  register(otpId: string): Promise<RegisterAccountOutput>
  getAccount(params: GetAccountInput): Promise<Account>
  createPendingRegistrationUser(
    params: CreatePendingRegistrationAccountInput,
  ): Promise<void>
}

@Injectable()
export class AccountService implements IAccountService {
  constructor(
    @Inject('OWNER_SERVICE')
    private readonly ownerService: OwnerService,

    @Inject('RENTER_SERVICE')
    private readonly renterService: RenterService,

    @Inject('ACCOUNT_REPOSITORY')
    private readonly accountsRepository: AccountsRepository,
  ) {}

  async register(otpId: string): Promise<RegisterAccountOutput> {
    const pendingRegistrationAccount =
      await this.getPendingRegistrationsUse(otpId)

    const registerUserAccountRoleStrategy = {
      [EAccountRole.OWNER]: this.registerOwnerAccount.bind(this),
      [EAccountRole.RENTER]: this.registerRenterAccount.bind(this),
    }

    const registerUserAccountExecutor =
      registerUserAccountRoleStrategy[pendingRegistrationAccount.role]

    if (!registerUserAccountExecutor) {
      throw new BadRequestException('Role not valid to create new account')
    }

    return await registerUserAccountExecutor({
      name: pendingRegistrationAccount.name,
      lastName: pendingRegistrationAccount.lastName,
      email: pendingRegistrationAccount.email,
      role: pendingRegistrationAccount.role,
      phoneNumber: pendingRegistrationAccount.phoneNumber,
    })
  }

  async createPendingRegistrationUser(
    params: CreatePendingRegistrationAccountInput,
  ): Promise<void> {
    try {
      await this.accountsRepository.createPendingRegistrationUser(params)

      return
    } catch (error) {
      throw new InternalServerErrorException(
        'An error has occurred to create pending registration',
      )
    }
  }

  private async registerOwnerAccount(
    params: RegisterAccountInput,
  ): Promise<RegisterAccountOutput> {
    const owner = await this.ownerService.register({
      email: params.email,
      lastName: params.lastName,
      name: params.name,
      phoneNumber: params.phoneNumber,
    })

    const account = await this.getAccount(params)

    return {
      owner,
      ...account,
    }
  }

  private async registerRenterAccount(
    params: RegisterAccountInput,
  ): Promise<RegisterAccountOutput> {
    const renter = await this.renterService.register({
      email: params.email,
      lastName: params.lastName,
      name: params.name,
      phoneNumber: params.phoneNumber,
    })

    const account = await this.getAccount(params)

    return {
      renter,
      ...account,
    }
  }

  private async getPendingRegistrationsUse(
    otpId: string,
  ): Promise<PendingRegistrationAccount> {
    try {
      const pendingRegistrationAccount =
        await this.accountsRepository.getPendingRegistrationAccount(otpId)

      return pendingRegistrationAccount
    } catch (error) {
      throw new InternalServerErrorException(
        'An error has occured while getting pending registration account',
      )
    }
  }

  async getAccount(params: GetAccountInput): Promise<Account> {
    const accounts = await this.accountsRepository.list({
      phoneNumber: params.phoneNumber,
      role: params.role,
      id: params.id,
    })

    if (!accounts) {
      throw new InternalServerErrorException(
        'Something failed to create account',
      )
    }

    if (accounts.length > 1) {
      throw new ConflictException('More than one account found for this user')
    }

    const account = accounts.at(0)

    return account!
  }
}
