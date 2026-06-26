import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common'
import { Property } from '@pkg/types'
import type { Pagination } from '@pkg/utils'
import { CurrentUser } from '@app/auth/decorators/current-user.decorator'
import type { AccessToken } from '@app/auth/domain/session'
import { CreatePropertyInput, UpdatePropertyInput } from './dto'
import type { FindAllPropertiesInput } from './dto'
import { CreatePropertyUseCase } from './use-cases/create-property.use-case'
import { FindAllPropertiesUseCase } from './use-cases/find-all-properties.use-case'
import { FindPropertyByIdUseCase } from './use-cases/find-property-by-id.use-case'
import { UpdatePropertyUseCase } from './use-cases/update-property.use-case'
import { DeletePropertyUseCase } from './use-cases/delete-property.use-case'

@Controller('properties')
export class PropertiesController {
  constructor(
    private readonly createUseCase: CreatePropertyUseCase,
    private readonly findAllUseCase: FindAllPropertiesUseCase,
    private readonly findByIdUseCase: FindPropertyByIdUseCase,
    private readonly updateUseCase: UpdatePropertyUseCase,
    private readonly deleteUseCase: DeletePropertyUseCase,
  ) {}

  @Get()
  async findAll(
    @Query() filters: FindAllPropertiesInput,
  ): Promise<Pagination<Property>> {
    return this.findAllUseCase.execute(filters)
  }

  @Get(':id')
  async findById(@Param('id', ParseUUIDPipe) id: string): Promise<Property> {
    return this.findByIdUseCase.execute(id)
  }

  @Post()
  async create(
    @Body() body: CreatePropertyInput,
    @CurrentUser() user: AccessToken,
  ): Promise<Property> {
    return this.createUseCase.execute({ ...body, createdBy: user.sub })
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdatePropertyInput,
    @CurrentUser() user: AccessToken,
  ): Promise<Property> {
    return this.updateUseCase.execute(id, { ...body, updatedBy: user.sub })
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.deleteUseCase.execute(id)
  }
}
