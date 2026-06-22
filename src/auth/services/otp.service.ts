import { EOtpChannel } from '@pkg/types'
import crypto from 'node:crypto'

export interface IOtpService {
  generateOtp(): { hash: string; code: string; expiresIn: number }
  normalizeDestination(destination: string, channel: EOtpChannel): string
  validateOtp(otpReceived: string, challengOtpHash: string): boolean
}

const minutesToExpireOtp = Number(process.env.MINUTES_TO_EXPIRE_OTP)

export class OtpService implements IOtpService {
  generateOtp(): { hash: string; code: string; expiresIn: number } {
    const nums: number[] = []

    for (let i = 0; i < 6; i++) {
      const num = crypto.randomInt(0, 10)
      nums.push(num)
    }

    const code = nums.join('')
    const hash = this.hashCode(code)

    return {
      code,
      hash,
      expiresIn: minutesToExpireOtp ?? 6,
    }
  }

  validateOtp(otpReceived: string, challengOtpHash: string): boolean {
    const hash = this.hashCode(otpReceived)

    return challengOtpHash === hash
  }

  normalizeDestination(destination: string, channel: EOtpChannel): string {
    if (channel === EOtpChannel.EMAIL) {
      return destination
    }

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
