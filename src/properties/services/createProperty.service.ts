import { Injectable } from '@nestjs/common'
import { Property } from '@pkg/types'

@Injectable()
export class CreatePropertyService {
  async execute(): Promise<Property> {
    return await Promise.resolve(undefined)
  }
}
