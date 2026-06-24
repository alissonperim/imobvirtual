import { Inject, Injectable } from '@nestjs/common'
import { Property } from '@pkg/types'
import type { IPropertiesRepository } from '../repositories/domain'
import type { CreatePropertyInput } from '../dto'

export interface ICreatePropertyUseCase {
  execute(params: CreatePropertyInput): Promise<Property>
}

@Injectable()
export class CreatePropertyUseCase implements ICreatePropertyUseCase {
  constructor(
    @Inject('PROPERTIES_REPOSITORY')
    private readonly repository: IPropertiesRepository,
  ) {}

  async execute(params: CreatePropertyInput): Promise<Property> {
    return this.repository.create(params)
  }
}
