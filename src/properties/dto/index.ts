import { EPropertyStatus } from '@pkg/types'
import { IsBoolean, IsEnum, IsNumber, IsString } from 'class-validator'
import { PartialType } from '@nestjs/mapped-types'

export class CreatePropertyInput {
  @IsString()
  name!: string

  @IsString({ validateIf: (value) => !!value })
  description?: string

  @IsNumber()
  baseRentAmount!: number

  @IsBoolean()
  solarEnergyActive!: boolean

  @IsEnum(EPropertyStatus)
  status!: EPropertyStatus

  @IsString()
  ownerId!: string

  @IsString({ validateIf: (value) => !!value })
  addressId?: string

  @IsString({ validateIf: (value) => !!value })
  createdBy?: string
}

export class UpdatePropertyInput extends PartialType(CreatePropertyInput) {
  @IsString({ validateIf: (value) => !!value })
  updatedBy?: string
}

export type FindAllPropertiesInput = {
  page?: number
  pageSize?: number
  ownerId?: string
  status?: EPropertyStatus
}
