import { EAccountRole, EAccountStatus } from '@pkg/types'

export type CreateAccountInput = {
  phoneNumber: string
  role: EAccountRole
  status: EAccountStatus
  name: string
}

export type GetByDestinationInput = Pick<CreateAccountInput, 'phoneNumber'>
