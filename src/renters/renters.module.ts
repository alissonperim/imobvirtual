import { Module } from '@nestjs/common'
import { RenterRepository } from './repository/impl/renter.repository'
import { RenterService } from './services/renter.service'

@Module({
  providers: [
    {
      provide: 'RENTER_REPOSITORY',
      useClass: RenterRepository,
    },
    {
      provide: 'RENTER_SERVICE',
      useClass: RenterService,
    },
  ],
})
export class RentersModule {}
