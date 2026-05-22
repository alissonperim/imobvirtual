import { Body, Controller, Get, Post } from '@nestjs/common'
import { CreatePropertyService } from './services/createProperty.service'
import type { PropertyDTO } from './dto'
import type { Property } from '@pkg/types'

@Controller('properties')
export class PropertiesController {
  constructor(private readonly createService: CreatePropertyService) {}

  @Get()
  async findAll(): Promise<string> {
    return await Promise.resolve('Hello properties')
  }

  @Post()
  async create(@Body() params: PropertyDTO): Promise<Property> {
    return this.createService.execute(params)
  }
}
