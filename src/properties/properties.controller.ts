import { Controller, Get } from '@nestjs/common'

@Controller('properties')
export class PropertiesController {
  @Get()
  async findAll(): Promise<string> {
    return await Promise.resolve('Hello properties')
  }
}
