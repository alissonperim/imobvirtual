import { Injectable } from '@nestjs/common'
import { Account, EAccountRole, EAccountStatus } from '@pkg/types'
import { PrismaService } from '@app/prisma/prisma.service'
import type { IAccountsRepository } from '../domain'
import type {
  CreateAccountInput,
  GetByDestinationInput,
} from '@app/accounts/domain'

@Injectable()
export class AccountsRepository implements IAccountsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(params: CreateAccountInput): Promise<Account> {
    const row = await this.prisma.account.create({
      data: {
        phone_number: params.phoneNumber,
        role: params.role,
        status: params.status,
      },
    })
    return this.toAccount(row)
  }

  async getByDestination(
    params: GetByDestinationInput,
  ): Promise<Account | undefined> {
    const row = await this.prisma.account.findFirst({
      where: { phone_number: params.phoneNumber, deleted_at: null },
    })

    if (!row) {
      return
    }

    return row ? this.toAccount(row) : undefined
  }

  async getById(id: string): Promise<Account | undefined> {
    const row = await this.prisma.account.findUnique({ where: { id } })
    return row ? this.toAccount(row) : undefined
  }

  private toAccount(row: {
    id: string
    phone_number: string
    role: string
    status: string
    last_login_at: Date | null
    created_at: Date
    updated_at: Date
    deleted_at: Date | null
    created_by: string | null
    updated_by: string | null
  }): Account {
    return {
      id: row.id,
      phoneNumber: row.phone_number,
      role: row.role as EAccountRole,
      status: row.status as EAccountStatus,
      lastLoginAt: row.last_login_at ?? undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      deletedAt: row.deleted_at ?? undefined,
      createdBy: row.created_by ?? undefined,
      updatedBy: row.updated_by ?? undefined,
    }
  }
}
