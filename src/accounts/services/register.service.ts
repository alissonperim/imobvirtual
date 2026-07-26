import { Account, EAccountRole } from '@pkg/types'
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

export interface IAccountService {
  register(params: RegisterAccountInput): Promise<RegisterAccountOutput>
  getAccount(params: GetAccountInput): Promise<Account>
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

  async register(params: RegisterAccountInput): Promise<RegisterAccountOutput> {
    const registerUserAccountRoleStrategy = {
      [EAccountRole.OWNER]: this.registerOwnerAccount.bind(this),
      [EAccountRole.RENTER]: this.registerRenterAccount.bind(this),
    }

    const registerUserAccountExecutor =
      registerUserAccountRoleStrategy[params.role]

    if (!registerUserAccountExecutor) {
      throw new BadRequestException('Role not valid to create new account')
    }

    return await registerUserAccountExecutor(params)
  }

  private async registerOwnerAccount(
    params: RegisterAccountInput,
  ): Promise<RegisterAccountOutput> {
    const owner = await this.ownerService.register(params)

    const account = await this.getAccount(params)

    return {
      owner,
      ...account,
    }
  }

  private async registerRenterAccount(
    params: RegisterAccountInput,
  ): Promise<RegisterAccountOutput> {
    const renter = await this.renterService.register(params)

    const account = await this.getAccount(params)

    return {
      renter,
      ...account,
    }
  }

  async getAccount(params: GetAccountInput): Promise<Account> {
    const accounts = await this.accountsRepository.list({
      phoneNumber: params.phoneNumber,
      role: params.role,
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
