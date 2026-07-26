import {
  Account,
  EAccountRole,
  Otp,
  PendingRegistrationAccount,
} from '@pkg/types'
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
  Logger,
} from '@nestjs/common'
import { RenterService } from '@app/renters/services/renter.service'
import { OwnerService } from '@app/owners/services/owner.service'
import { AccountsRepository } from '../repositories/implementations/accounts.repository'
import { CreatePendingRegistrationAccountInput } from '../domain'

export interface IAccountService {
  register(otp: Otp): Promise<RegisterAccountOutput>
  getAccount(params: GetAccountInput): Promise<Account>
  createPendingRegistrationUser(
    params: CreatePendingRegistrationAccountInput,
  ): Promise<void>
}

@Injectable()
export class AccountService implements IAccountService {
  private readonly logger = new Logger(AccountService.name)

  constructor(
    @Inject('OWNER_SERVICE')
    private readonly ownerService: OwnerService,

    @Inject('RENTER_SERVICE')
    private readonly renterService: RenterService,

    @Inject('ACCOUNTS_REPOSITORY')
    private readonly accountsRepository: AccountsRepository,
  ) {}

  async register(otp: Otp): Promise<RegisterAccountOutput> {
    const pendingRegistrationAccount = await this.getPendingRegistrationsUse(
      otp.id,
    )

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
      otp,
    })
  }

  async createPendingRegistrationUser(
    params: CreatePendingRegistrationAccountInput,
  ): Promise<void> {
    try {
      await this.accountsRepository.createPendingRegistrationUser(params)

      return
    } catch (error) {
      this.logger.error(
        'An error has occurred while creating pending registration user',
        {
          error,
        },
      )
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
      account: {
        otps: [params.otp],
        role: params.role,
      },
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
      account: {
        role: params.role,
        otps: [params.otp],
      },
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
      this.logger.error(
        'An error has occurred to get pending registration user',
        {
          error,
        },
      )
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
