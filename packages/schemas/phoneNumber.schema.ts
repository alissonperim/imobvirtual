import yup from './yup.schema'

export const phoneNumberSchema = (): yup.StringSchema => {
  return yup
    .string()
    .transform((value) => value.replace(/^\D/g, ''))
    .length(11)
    .test(
      'validate_phone_number',
      'phoneNumber does not match with a local brazilian phone number',
      (value: string | undefined) => {
        if (value === undefined) {
          return true
        }

        const regex = /^(([1-9]{2})?)(\d{5})(\d{4})$/

        const isPhoneNumberValid = regex.test(value)

        if (isPhoneNumberValid) {
          return true
        }

        return false
      },
    )
}
