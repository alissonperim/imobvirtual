import { Base } from './Base'

export enum EOtpChannel {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  WHATSAPP = 'WHATSAPP',
}

export type Otp = Base & {
  id: string
  destination: string //email ou phoneNumber
  channel: EOtpChannel
  accountId?: string
  codeHash: string
  expiresAt: Date
  attempts: number
  consumedContext?: {
    ip?: string
    consumedAt: Date
    geolocation?: string
  }
}
