import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { IsNull, Repository } from 'typeorm'
import { Account, EAccountRole, PendingRegistrationAccount } from '@pkg/types'
import {
  AccountEntity,
  PendingRegistrationEntity,
} from '@app/database/entities'
import type { IAccountsRepository } from '../domain'
import type {
  CreateAccountInput,
  CreatePendingRegistrationAccountInput,
} from '@app/accounts/domain'
import { GetByDestinationInput } from '@app/accounts/domain/account'

@Injectable()
export class AccountsRepository implements IAccountsRepository {
  constructor(
    @InjectRepository(AccountEntity)
    private readonly repository: Repository<AccountEntity>,

    @InjectRepository(PendingRegistrationEntity)
    private readonly pendingRegistrationRepository: Repository<PendingRegistrationEntity>,
  ) {}

  async create(params: CreateAccountInput): Promise<Account> {
    const entity = this.repository.create({
      role: params.role,
      status: params.status,
    })
    const saved = await this.repository.save(entity)
    return this.toAccount(saved)
  }

  async createPendingRegistrationUser(
    params: CreatePendingRegistrationAccountInput,
  ): Promise<void> {
    const entity = this.pendingRegistrationRepository.create({
      email: params.email,
      phoneNumber: params.phoneNumber,
      role: params.role,
      name: params.name,
      lastName: params.lastName,
      otpId: params.otpId,
    })

    await this.pendingRegistrationRepository.save(entity)
  }

  async getPendingRegistrationAccount(
    otpId: string,
  ): Promise<PendingRegistrationAccount> {
    return await this.pendingRegistrationRepository.findOneByOrFail({
      otpId,
    })
  }

  async list(params: GetByDestinationInput): Promise<Account[] | undefined> {
    const userRoleQuery = {}

    if (params.role === EAccountRole.OWNER) {
      Object.assign(userRoleQuery, {
        owner: {
          phoneNumber: params.phoneNumber,
        },
      })
    }

    if (params.role === EAccountRole.RENTER) {
      Object.assign(userRoleQuery, {
        renter: {
          phoneNumber: params.phoneNumber,
        },
      })
    }

    const idQuery = {
      id: params.id,
    }

    const rows = await this.repository.find({
      where: {
        ...userRoleQuery,
        ...idQuery,
        deletedAt: IsNull(),
      },
    })

    if (!rows.length) {
      return []
    }

    return rows.map(this.toAccount)
  }

  async getById(id: string): Promise<Account> {
    const row = await this.repository.findOneByOrFail({ id })
    return this.toAccount(row)
  }

  private toAccount(row: AccountEntity): Account {
    return {
      id: row.id,
      role: row.role,
      status: row.status,
      otps: row.otps,
      sessions: row.sessions,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      deletedAt: row.deletedAt ?? undefined,
      createdBy: row.createdBy ?? undefined,
      updatedBy: row.updatedBy ?? undefined,
    }
  }
}
