import { phoneNumberSchema } from '../phoneNumber.schema'
import yup from '../yup.schema'

const valideteSync = (schema: yup.AnySchema, obj: unknown) => {
  try {
    schema.validateSync(obj, { abortEarly: false })

    return null
  } catch (error) {
    return (error as yup.ValidationError).errors.join(', ')
  }
}

describe('phoneNumber.schema tests', () => {
  const testSchema = yup.object({
    phoneNumber: phoneNumberSchema(),
  })

  it('should return valid schema', () => {
    const schema = {
      phoneNumber: '62996278299',
    }
    expect(testSchema.isValidSync(schema)).toBe(true)
  })

  it('should return invvalid schema', () => {
    const schema = {
      phoneNumber: '6299627829',
    }
    expect(testSchema.isValidSync(schema)).toBe(false)
  })

  it('should return invalid schema message', () => {
    const schema = {
      phoneNumber: '',
    }

    expect(valideteSync(testSchema, schema)).toStrictEqual(
      'phoneNumber must be exactly 11 characters, phoneNumber does not match with a local brazilian phone number',
    )
  })

  it('should be valid when the schema is optional and the data received is empty', () => {
    const testSchema = yup.object({
      phoneNumber: phoneNumberSchema().optional(),
    })
    const schema = {
      phoneNumber: undefined,
    }

    expect(valideteSync(testSchema, schema)).toBe(null)
  })

  it('should return invalid when the schema is required', () => {
    const testSchema = yup.object({
      phoneNumber: phoneNumberSchema().required(),
    })
    const schema = {
      phoneNumber: undefined,
    }

    expect(valideteSync(testSchema, schema)).toStrictEqual(
      'phoneNumber is a required field',
    )
  })
})
