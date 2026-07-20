import { BRAZILIAN_STATES } from '@pkg/types'
import * as yup from 'yup'

export const addressSchema = yup
  .object({
    street: yup.string().max(240).required(),
    neighborhood: yup.string().max(240).required(),
    postalCode: yup
      .string()
      .transform((value: string) => value.replace(/[^a-zA-Z0-9]/g, ''))
      .length(8, 'The postalCode must have only 8 numeric characters.')
      .required(),
    complement: yup.string().max(240).required(),
    city: yup.string().max(120).required(),
    state: yup.mixed().oneOf(BRAZILIAN_STATES).required(),
    number: yup.string().max(12).required(),
  })
  .noUnknown()
