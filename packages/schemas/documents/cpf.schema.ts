import yup from '../yup.schema'

export const cpfSchema = (): yup.StringSchema =>
  yup.string().test((value: string | undefined) => {})
