import { Body, Controller, Get, Post } from '@nestjs/common'
import type { PropertyDTO } from './dto'
import type { Property } from '@pkg/types'
import { CreatePropertyUseCase } from './use-cases/create-property.use-case'

@Controller('properties')
export class PropertiesController {
  constructor(private readonly createService: CreatePropertyUseCase) {}

  @Get()
  async findAll(): Promise<string> {
    return await Promise.resolve('Hello properties')
  }

  @Post()
  async create(@Body() params: PropertyDTO): Promise<Property> {
    return this.createService.execute(params)
  }
}
