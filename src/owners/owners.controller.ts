import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common'
import { Owner } from '@pkg/types'
import type { Pagination } from '@pkg/utils'
import { CurrentUser } from '@app/auth/decorators/current-user.decorator'
import type { AccessToken } from '@app/auth/domain/session'
import { CreateOwnerInput, UpdateOwnerInput } from './dto'
import type { FindAllOwnersInput } from './dto'
import { CreateOwnerUseCase } from './use-cases/create-owner.use-case'
import { FindAllOwnersUseCase } from './use-cases/find-all-owners.use-case'
import { FindOwnerByIdUseCase } from './use-cases/find-owner-by-id.use-case'
import { UpdateOwnerUseCase } from './use-cases/update-owner.use-case'
import { DeleteOwnerUseCase } from './use-cases/delete-owner.use-case'

@Controller('owners')
export class OwnersController {
  constructor(
    private readonly createUseCase: CreateOwnerUseCase,
    private readonly findAllUseCase: FindAllOwnersUseCase,
    private readonly findByIdUseCase: FindOwnerByIdUseCase,
    private readonly updateUseCase: UpdateOwnerUseCase,
    private readonly deleteUseCase: DeleteOwnerUseCase,
  ) {}

  @Get()
  async findAll(
    @Query() filters: FindAllOwnersInput,
  ): Promise<Pagination<Owner>> {
    return this.findAllUseCase.execute(filters)
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<Owner> {
    return this.findByIdUseCase.execute(id)
  }

  @Post()
  async create(
    @Body() body: CreateOwnerInput,
    @CurrentUser() user: AccessToken,
  ): Promise<Owner> {
    return this.createUseCase.execute({ ...body, createdBy: user.sub })
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() body: UpdateOwnerInput,
    @CurrentUser() user: AccessToken,
  ): Promise<Owner> {
    return this.updateUseCase.execute(id, { ...body, updatedBy: user.sub })
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string): Promise<void> {
    return this.deleteUseCase.execute(id)
  }
}
