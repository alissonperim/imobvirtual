import { EOtpChannel } from '@pkg/types'
import { OtpService } from '../otp-service'

describe('otp-service tests', () => {
  it('should be able to return the phone number with only 11 characters when channel is equal to sms', () => {
    expect(
      OtpService.normalizeDestination('+5562999824266', EOtpChannel.SMS),
    ).toHaveLength(11)
  })

  it('should be able to return the phone number with only 11 characters when channel is equal to whatsapp', () => {
    expect(
      OtpService.normalizeDestination('+5562999824266', EOtpChannel.WHATSAPP),
    ).toHaveLength(11)
  })

  it('should not change the destination when channel is equal to email', () => {
    const destination = 'mail@mail.com'

    expect(
      OtpService.normalizeDestination(destination, EOtpChannel.EMAIL),
    ).toEqual(destination)
  })

  it('should be able to test the generation of otp code', () => {
    const code = OtpService.generateCode()

    expect(code).toHaveLength(6)
    code.split('').forEach((t) => expect(Number(t)).toBeLessThan(10))
  })
})
