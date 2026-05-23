import { Base } from './Base'

export enum EOtpChannel {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  WHATSAPP = 'WHATSAPP',
}

export type OtpCode = Base & {
  id: string
  destination: string //email ou phoneNumber
  channel: EOtpChannel
  codeHash: string
  expiresAt: Date
  attempts: number
  consumedContext: {
    ip?: string
    consumedAt: Date
    geolocation?: string
  }
}
