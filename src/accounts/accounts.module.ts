import { Module } from '@nestjs/common'
import { AccountsRepository } from './repositories/implementations/accounts.repository'
import { OwnersModule } from '@app/owners/owners.module'
import { RentersModule } from '@app/renters/renters.module'
import { AccountService } from './services/register.service'

@Module({
  providers: [
    {
      provide: 'ACCOUNTS_REPOSITORY',
      useClass: AccountsRepository,
    },
    {
      provide: 'ACCOUNTS_SERVICE',
      useClass: AccountService,
    },
  ],
  exports: ['ACCOUNTS_REPOSITORY', 'ACCOUNTS_SERVICE'],
  imports: [OwnersModule, RentersModule],
})
export class AccountsModule {}
