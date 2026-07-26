import { EAccountRole, EAccountStatus } from '@pkg/types'

export type CreateAccountInput = {
  role: EAccountRole
  status: EAccountStatus
}
