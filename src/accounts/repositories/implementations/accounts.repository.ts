import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { IsNull, Repository } from 'typeorm'
import { Account, EAccountRole } from '@pkg/types'
import { AccountEntity } from '@app/database/entities'
import type { IAccountsRepository } from '../domain'
import type { CreateAccountInput } from '@app/accounts/domain'
import { GetByDestinationInput } from '@app/accounts/domain/account'

@Injectable()
export class AccountsRepository implements IAccountsRepository {
  constructor(
    @InjectRepository(AccountEntity)
    private readonly repository: Repository<AccountEntity>,
  ) {}

  async create(params: CreateAccountInput): Promise<Account> {
    const entity = this.repository.create({
      role: params.role,
      status: params.status,
    })
    const saved = await this.repository.save(entity)
    return this.toAccount(saved)
  }

  async list(params: GetByDestinationInput): Promise<Account[] | undefined> {
    const userRoleQuery = {}

    if (params.role === EAccountRole.OWNER) {
      Object.assign(userRoleQuery, {
        owner: {
          phoneNumner: params.phoneNumber,
        },
      })
    }

    if (params.role === EAccountRole.RENTER) {
      Object.assign(userRoleQuery, {
        renter: {
          phoneNumner: params.phoneNumber,
        },
      })
    }

    const rows = await this.repository.find({
      where: {
        ...userRoleQuery,
        deletedAt: IsNull(),
      },
    })

    return rows.length ? rows.map(this.toAccount) : undefined
  }

  async getById(id: string): Promise<Account | undefined> {
    const row = await this.repository.findOne({ where: { id } })
    return row ? this.toAccount(row) : undefined
  }

  private toAccount(row: AccountEntity): Account {
    return {
      id: row.id,
      role: row.role,
      status: row.status,
      lastLoginAt: row.lastLoginAt ?? undefined,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      deletedAt: row.deletedAt ?? undefined,
      createdBy: row.createdBy ?? undefined,
      updatedBy: row.updatedBy ?? undefined,
    }
  }
}
