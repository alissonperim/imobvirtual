import { Module } from '@nestjs/common'
import { OwnersController } from './owners.controller'
import { OwnersRepository } from './repositories/implementation/owners.repository'
import { CreateOwnerUseCase } from './use-cases/create-owner.use-case'
import { FindAllOwnersUseCase } from './use-cases/find-all-owners.use-case'
import { FindOwnerByIdUseCase } from './use-cases/find-owner-by-id.use-case'
import { UpdateOwnerUseCase } from './use-cases/update-owner.use-case'
import { DeleteOwnerUseCase } from './use-cases/delete-owner.use-case'

@Module({
  controllers: [OwnersController],
  providers: [
    { provide: 'OWNERS_REPOSITORY', useClass: OwnersRepository },
    CreateOwnerUseCase,
    FindAllOwnersUseCase,
    FindOwnerByIdUseCase,
    UpdateOwnerUseCase,
    DeleteOwnerUseCase,
  ],
})
export class OwnersModule {}
