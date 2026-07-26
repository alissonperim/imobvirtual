import yup from '@pkg/schemas'

export const SignUpOtpChallengeInputSchema = yup
  .object({
    otpId: yup.string().length(24).required(),
    otp: yup.string().length(6).required(),
  })
  .required()
  .noUnknown()
