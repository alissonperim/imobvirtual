import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { PropertiesModule } from './properties/properties.module'
import { AddressesModule } from './addresses/addresses.module'
import { CustomersModule } from './customers/customers.module'

@Module({
  imports: [PropertiesModule, AddressesModule, CustomersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
