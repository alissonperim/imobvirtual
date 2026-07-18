import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { IsNull, Repository } from 'typeorm'
import { Account } from '@pkg/types'
import { AccountEntity } from '@app/database/entities'
import type { IAccountsRepository } from '../domain'
import type {
  CreateAccountInput,
  GetByDestinationInput,
} from '@app/accounts/domain'

@Injectable()
export class AccountsRepository implements IAccountsRepository {
  constructor(
    @InjectRepository(AccountEntity)
    private readonly repository: Repository<AccountEntity>,
  ) {}

  async create(params: CreateAccountInput): Promise<Account> {
    const entity = this.repository.create({
      phoneNumber: params.phoneNumber,
      role: params.role,
      status: params.status,
    })
    const saved = await this.repository.save(entity)
    return this.toAccount(saved)
  }

  async getByDestination(
    params: GetByDestinationInput,
  ): Promise<Account | undefined> {
    const row = await this.repository.findOne({
      where: { phoneNumber: params.phoneNumber, deletedAt: IsNull() },
    })
    return row ? this.toAccount(row) : undefined
  }

  async getById(id: string): Promise<Account | undefined> {
    const row = await this.repository.findOne({ where: { id } })
    return row ? this.toAccount(row) : undefined
  }

  private toAccount(row: AccountEntity): Account {
    return {
      id: row.id,
      phoneNumber: row.phoneNumber,
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
