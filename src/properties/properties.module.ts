import { Module } from '@nestjs/common'
import { PropertiesController } from './properties.controller'
import { CreatePropertyUseCase } from './use-cases/create-property.use-case'
import { PropertiesRepository } from './repositories/implementation/properties.repository'

@Module({
  controllers: [PropertiesController],
  providers: [
    CreatePropertyUseCase,
    {
      provide: 'PROPERTIES_REPOSITORY',
      useClass: PropertiesRepository,
    },
  ],
})
export class PropertiesModule {}
