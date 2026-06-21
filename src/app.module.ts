import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { PropertiesModule } from './properties/properties.module'
import { AddressesModule } from './addresses/addresses.module'
import { OwnersModule } from './owners/owners.module'
import { RentalContractsModule } from './rental-contracts/rental-contracts.module'
import { RentersModule } from './renters/renters.module'
import { AuthModule } from './auth/auth.module'
import { AccountsModule } from './accounts/accounts.module'

@Module({
  imports: [
    PropertiesModule,
    AddressesModule,
    OwnersModule,
    RentalContractsModule,
    RentersModule,
    AuthModule,
    AccountsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
