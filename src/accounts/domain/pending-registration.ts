import { EAccountRole } from '@pkg/types'

export type CreatePendingRegistrationAccountInput = {
  name?: string
  lastName?: string
  email?: string
  role?: EAccountRole
  phoneNumber?: string
  otpId?: string
}
