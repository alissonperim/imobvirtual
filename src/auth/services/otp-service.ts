import { EOtpChannel } from '@pkg/types'
import crypto from 'node:crypto'

export interface IOtpService {
  generateOtp(): { hash: string; code: string; expiresIn: number }
  normalizeDestination(destination: string, channel: EOtpChannel): string
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

  normalizeDestination(destination: string, channel: EOtpChannel): string {
    if (channel === EOtpChannel.EMAIL) {
      return destination
    }

    if (destination.length > 11) {
      return destination.slice(3)
    }

    return destination
  }

  private hashCode(code: string): string {
    return crypto.createHash('sha256').update(code).digest('base64')
  }
}
