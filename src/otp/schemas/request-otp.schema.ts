import yup, { phoneNumberSchema } from '@pkg/schemas'
import { EAccountRole, EOtpChannel, EOtpPurpose } from '@pkg/types'

const isSignUp = (purpose: EOtpPurpose) => purpose === EOtpPurpose.SIGN_UP

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
  name: yup.string().min(3).max(120).when('purpose', {
    is: isSignUp,
    then: (schema) => schema.required(),
  }),
  lastName: yup.string().min(3).max(120).when('purpose', {
    is: isSignUp,
    then: (schema) => schema.required(),
  }),
  email: yup.string().email().when('purpose', {
    is: isSignUp,
    then: (schema) => schema.required(),
  }),
})
