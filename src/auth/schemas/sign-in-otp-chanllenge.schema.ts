import yup from '@pkg/schemas'

export const SignInOtpChallengeInputSchema = yup
  .object({
    otpId: yup.string().length(24).required(),
    otp: yup.string().length(6).required(),
    customerId: yup.string().length(24).required(),
  })
  .required()
  .noUnknown()
