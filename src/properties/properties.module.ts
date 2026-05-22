import { Module } from '@nestjs/common'
import { PropertiesController } from './properties.controller'
import { CreatePropertyService } from './services/createProperty.service'
import { PropertiesRepository } from './repositories/implementation/properties.repository'

@Module({
  controllers: [PropertiesController],
  providers: [
    CreatePropertyService,
    {
      provide: 'PROPERTIES_REPOSITORY',
      useClass: PropertiesRepository,
    },
  ],
})
export class PropertiesModule {}
