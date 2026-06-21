import { EOtpChannel } from '@pkg/types'
import crypto from 'node:crypto'
import { OtpService } from '../otp-service'

describe('OtpService', () => {
  let sut: OtpService

  beforeEach(() => {
    sut = new OtpService()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('normalizeDestination', () => {
    it.each([EOtpChannel.SMS, EOtpChannel.WHATSAPP])(
      'should remove the country code from a phone number sent through %s',
      (channel) => {
        expect(sut.normalizeDestination('+5562999824266', channel)).toBe(
          '62999824266',
        )
      },
    )

    it('should keep a phone number that is already normalized', () => {
      const destination = '62999824266'

      expect(sut.normalizeDestination(destination, EOtpChannel.SMS)).toBe(
        destination,
      )
    })

    it('should remove formatting from a phone number without a country code', () => {
      expect(
        sut.normalizeDestination('(62) 99982-4266', EOtpChannel.WHATSAPP),
      ).toBe('62999824266')
    })

    it('should not change an email destination', () => {
      const destination = 'mail@mail.com'

      expect(sut.normalizeDestination(destination, EOtpChannel.EMAIL)).toBe(
        destination,
      )
    })
  })

  describe('generateOtp', () => {
    it('should generate a six-digit code and its SHA-256 hash', () => {
      const randomNumbers = [0, 1, 2, 7, 8, 9]
      const spyOnCrypto = jest
        .spyOn(crypto, 'randomInt')
        .mockImplementation(() => randomNumbers.shift() as number)

      const otp = sut.generateOtp()
      const expectedHash = crypto
        .createHash('sha256')
        .update('012789')
        .digest('base64')

      expect(spyOnCrypto).toHaveBeenCalledTimes(6)
      expect(spyOnCrypto).toHaveBeenCalledWith(0, 10)
      expect(otp).toEqual(
        expect.objectContaining({
          code: '012789',
          hash: expectedHash,
        }),
      )
    })
  })

  describe('validateOtp', () => {
    it('should return true when the OTP matches the challenge hash', () => {
      const hash = crypto.createHash('sha256').update('123456').digest('base64')

      expect(sut.validateOtp('123456', hash)).toBe(true)
    })

    it('should return false when the OTP does not match the challenge hash', () => {
      const hash = crypto.createHash('sha256').update('123456').digest('base64')

      expect(sut.validateOtp('654321', hash)).toBe(false)
    })
  })
})
