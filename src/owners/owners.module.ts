import { Module } from '@nestjs/common'
import { OwnersController } from './owners.controller'
import { OwnersRepository } from './repositories/implementation/owners.repository'
import { FindAllOwnersUseCase } from './use-cases/find-all-owners.use-case'
import { FindOwnerByIdUseCase } from './use-cases/find-owner-by-id.use-case'
import { UpdateOwnerUseCase } from './use-cases/update-owner.use-case'
import { DeleteOwnerUseCase } from './use-cases/delete-owner.use-case'
import { OwnerService } from './services/owner.service'

@Module({
  controllers: [OwnersController],
  providers: [
    { provide: 'OWNERS_REPOSITORY', useClass: OwnersRepository },
    { provide: 'OWNER_SERVICE', useClass: OwnerService },
    FindAllOwnersUseCase,
    FindOwnerByIdUseCase,
    UpdateOwnerUseCase,
    DeleteOwnerUseCase,
  ],
  exports: ['OWNER_SERVICE'],
})
export class OwnersModule {}
