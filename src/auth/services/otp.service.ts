import crypto from 'node:crypto'

export type GeneratedOtp = {
  hash: string
  code: string
  expiresAt: Date
  expiresInSeconds: number
}

export interface IOtpService {
  generateOtp(): GeneratedOtp
  normalizeDestination(destination: string): string
  validateOtp(otpReceived: string, challengOtpHash: string): boolean
}

const configuredExpirationMinutes = Number(process.env.MINUTES_TO_EXPIRE_OTP)
const expirationMinutes =
  Number.isFinite(configuredExpirationMinutes) &&
  configuredExpirationMinutes > 0
    ? configuredExpirationMinutes
    : 6

export class OtpService implements IOtpService {
  generateOtp(): GeneratedOtp {
    const nums: number[] = []

    for (let i = 0; i < 6; i++) {
      const num = crypto.randomInt(0, 10)
      nums.push(num)
    }

    const code = nums.join('')
    const hash = this.hashCode(code)
    const expiresInSeconds = expirationMinutes * 60

    return {
      code,
      hash,
      expiresAt: new Date(Date.now() + expiresInSeconds * 1000),
      expiresInSeconds,
    }
  }

  validateOtp(otpReceived: string, challengOtpHash: string): boolean {
    const hash = this.hashCode(otpReceived)

    return challengOtpHash === hash
  }

  normalizeDestination(destination: string): string {
    const normalizedDestination = destination.replace(/\D/g, '')
    if (
      normalizedDestination.length > 11 &&
      normalizedDestination.startsWith('55')
    ) {
      return normalizedDestination.slice(2)
    }

    return normalizedDestination
  }

  private hashCode(code: string): string {
    return crypto.createHash('sha256').update(code).digest('base64')
  }
}
