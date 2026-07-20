import * as yup from 'yup'
import { EMaritalStatus } from '@pkg/types'
import { addressSchema } from '@pkg/utils/yup-schemas'

export const updateOwnerSchema = yup
  .object({
    name: yup.string().min(3).max(120).optional(),
    lastName: yup.string().min(3).max(120).optional(),
    maritalStatus: yup
      .mixed<EMaritalStatus>()
      .oneOf(Object.values(EMaritalStatus))
      .optional(),
    address: addressSchema.optional(),
  })
  .noUnknown()
  .required()
