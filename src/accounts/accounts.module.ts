import { Module } from '@nestjs/common'
import { AccountsRepository } from './repositories/implementations/accounts.repository'

@Module({
  providers: [
    {
      provide: 'ACCOUNTS_REPOSITORY',
      useClass: AccountsRepository,
    },
  ],
  exports: ['ACCOUNTS_REPOSITORY'],
})
export class AccountsModule {}
