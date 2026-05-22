import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { PropertiesModule } from './properties/properties.module'
import { AddressesModule } from './addresses/addresses.module'
import { OwnersModule } from './owners/owners.module'
import { RentalContractsModule } from './rental-contracts/rental-contracts.module'
import { RentersModule } from './renters/renters.module'

@Module({
  imports: [
    PropertiesModule,
    AddressesModule,
    OwnersModule,
    RentalContractsModule,
    RentersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
