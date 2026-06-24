import { Module } from '@nestjs/common'
import { PropertiesController } from './properties.controller'
import { PropertiesRepository } from './repositories/implementation/properties.repository'
import { CreatePropertyUseCase } from './use-cases/create-property.use-case'
import { FindAllPropertiesUseCase } from './use-cases/find-all-properties.use-case'
import { FindPropertyByIdUseCase } from './use-cases/find-property-by-id.use-case'
import { UpdatePropertyUseCase } from './use-cases/update-property.use-case'
import { DeletePropertyUseCase } from './use-cases/delete-property.use-case'

@Module({
  controllers: [PropertiesController],
  providers: [
    { provide: 'PROPERTIES_REPOSITORY', useClass: PropertiesRepository },
    CreatePropertyUseCase,
    FindAllPropertiesUseCase,
    FindPropertyByIdUseCase,
    UpdatePropertyUseCase,
    DeletePropertyUseCase,
  ],
})
export class PropertiesModule {}
