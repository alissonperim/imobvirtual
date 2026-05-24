import { EOtpChannel } from '@pkg/types'

export class OtpService {
  static generateCode(): string {
    const nums: number[] = []

    for (let i = 0; i < 6; i++) {
      const num: number = Math.floor(Math.random() * 10)
      nums.push(num)
    }

    return nums.join('')
  }

  static normalizeDestination(destination: string, channel: EOtpChannel) {
    if (channel === EOtpChannel.EMAIL) {
      return destination
    }

    if (destination.length > 11) {
      return destination.slice(3)
    }

    return destination
  }
}
