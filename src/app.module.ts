import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { PrismaModule } from './prisma/prisma.module'
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard'
import { PropertiesModule } from './properties/properties.module'
import { OwnersModule } from './owners/owners.module'
import { RentalContractsModule } from './rental-contracts/rental-contracts.module'
import { RentersModule } from './renters/renters.module'
import { AuthModule } from './auth/auth.module'
import { AccountsModule } from './accounts/accounts.module'

@Module({
  imports: [
    PrismaModule,
    PropertiesModule,
    OwnersModule,
    RentalContractsModule,
    RentersModule,
    AuthModule,
    AccountsModule,
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: JwtAuthGuard }],
})
export class AppModule {}
