import * as yup from 'yup'
import { EPropertyStatus } from '@pkg/types'
import { addressSchema } from '@pkg/utils/yup-schemas'

export const updatePropertySchema = yup
  .object({
    description: yup.string().max(500).optional(),
    rentAmount: yup.number().positive().optional(),
    solarEnergyActive: yup.boolean().optional(),
    status: yup
      .mixed<EPropertyStatus>()
      .oneOf(Object.values(EPropertyStatus))
      .optional(),
    address: addressSchema.optional(),
  })
  .noUnknown()
  .required()
