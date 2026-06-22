import { Base } from './Base'

export enum EOtpChannel {
  SMS = 'SMS',
  WHATSAPP = 'WHATSAPP',
}

export enum EOtpPurpose {
  SIGN_IN = 'SIGN_IN',
  SIGN_UP = 'SIGN_UP',
  CHANGE_EMAIL = 'CHANGE_EMAIL',
  CHANGE_PHONE = 'CHANGE_PHONE',
  PASSWORD_RECOVERY = 'PASSWORD_RECOVERY',
}

export type Otp = Base & {
  id: string
  destination: string
  purpose: EOtpPurpose
  channel: EOtpChannel
  accountId?: string
  codeHash: string
  expiresAt: Date
  attempts: number
  consumedAt?: Date
}
