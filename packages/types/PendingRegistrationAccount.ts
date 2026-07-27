import { EAccountRole } from './Account'

export type PendingRegistrationAccount = {
  email: string
  phoneNumber: string
  name: string
  lastName: string
  role: EAccountRole
  otpId: string
}
