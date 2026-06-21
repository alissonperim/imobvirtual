import { EAccountRole, EAccountStatus } from '@pkg/types'

export type CreateAccountInput = {
  email?: string
  phoneNumber?: string
  role: EAccountRole
  status: EAccountStatus
}

export type GetByDestinationInput = Pick<
  CreateAccountInput,
  'email' | 'phoneNumber'
>
