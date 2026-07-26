import yup, { phoneNumberSchema } from '@pkg/schemas'
import { EAccountRole, EOtpChannel, EOtpPurpose } from '@pkg/types'

export const requestOtpSchema = yup.object({
  phoneNumber: phoneNumberSchema().required(),
  channel: yup
    .mixed<EOtpChannel>()
    .oneOf(Object.values(EOtpChannel))
    .required(),
  purpose: yup
    .mixed<EOtpPurpose>()
    .oneOf(Object.values(EOtpPurpose))
    .required(),
  role: yup.mixed<EAccountRole>().oneOf(Object.values(EAccountRole)).required(),
})
