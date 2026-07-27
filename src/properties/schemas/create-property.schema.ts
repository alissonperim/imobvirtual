import * as yup from 'yup'
import { EPropertyStatus } from '@pkg/types'
import { addressSchema } from '@pkg/utils/yup-schemas'

export const createPropertySchema = yup
  .object({
    description: yup.string().max(500).required(),
    rentAmount: yup.number().positive().required(),
    solarEnergyActive: yup.boolean().required(),
    status: yup
      .mixed<EPropertyStatus>()
      .oneOf(Object.values(EPropertyStatus))
      .required(),
    ownerId: yup.string().length(24).required(),
    address: addressSchema.required(),
  })
  .noUnknown()
  .required()
