import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common'
import { ValidationError } from 'yup'
import type { AnyObjectSchema } from 'yup'

@Injectable()
export class YupValidationPipe implements PipeTransform {
  constructor(private schema: AnyObjectSchema) {}

  async transform(value: unknown): Promise<unknown> {
    try {
      return await this.schema.validate(value, {
        abortEarly: false,
        stripUnknown: true,
      })
    } catch (error) {
      if (error instanceof ValidationError) {
        throw new BadRequestException({
          message: 'Validation failed',
          errors: error.inner.map((err) => ({
            field: err.path,
            message: err.message,
          })),
        })
      }
      throw error
    }
  }
}
