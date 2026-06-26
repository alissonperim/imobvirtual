import { EMaritalStatus } from '@pkg/types'
import { IsEmail, IsEnum, IsPhoneNumber, IsString } from 'class-validator'
import { PartialType } from '@nestjs/mapped-types'

export class CreateOwnerInput {
  @IsString()
  name!: string

  @IsString()
  document!: string

  @IsPhoneNumber('BR')
  phoneNumber!: string

  @IsEmail()
  email?: string

  @IsEnum(EMaritalStatus)
  maritalStatus!: EMaritalStatus

  @IsString()
  accountId!: string

  @IsString()
  addressId!: string

  @IsString({ validateIf: (value) => !!value })
  createdBy?: string
}

export class UpdateOwnerInput extends PartialType(CreateOwnerInput) {
  @IsString({ validateIf: (value) => !!value })
  updatedBy?: string
}

export type FindAllOwnersInput = {
  page?: number
  pageSize?: number
}
