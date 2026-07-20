import * as yup from 'yup'
import { EMaritalStatus } from '@pkg/types'
import { addressSchema } from '@pkg/utils/yup-schemas'

export const createOwnerSchema = yup
  .object({
    name: yup.string().min(3).max(120).required(),
    lastName: yup.string().min(3).max(120).required(),
    document: yup.string().length(11).required(),
    phoneNumber: yup
      .string()
      .transform((value: string) => value.replace(/[^a-zA-Z0-9]/g, ''))
      .length(11, 'The phoneNumber must have only 11 number caracteres.')
      .required(),
    email: yup.string().email().optional(),
    maritalStatus: yup
      .mixed<EMaritalStatus>()
      .oneOf(Object.values(EMaritalStatus))
      .required(),
    accountId: yup.string().length(21).required(),
    address: addressSchema.required(),
  })
  .noUnknown()
  .required()
