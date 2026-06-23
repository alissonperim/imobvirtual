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
        phoneNumber: params.phoneNumber,
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
      where: { phoneNumber: params.phoneNumber, deletedAt: null },
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
    phoneNumber: string
    role: string
    status: string
    lastLoginAt: Date | null
    createdAt: Date
    updatedAt: Date
    deletedAt: Date | null
    createdBy: string | null
    updatedBy: string | null
  }): Account {
    return {
      id: row.id,
      phoneNumber: row.phoneNumber,
      role: row.role as EAccountRole,
      status: row.status as EAccountStatus,
      lastLoginAt: row.lastLoginAt ?? undefined,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      deletedAt: row.deletedAt ?? undefined,
      createdBy: row.createdBy ?? undefined,
      updatedBy: row.updatedBy ?? undefined,
    }
  }
}
