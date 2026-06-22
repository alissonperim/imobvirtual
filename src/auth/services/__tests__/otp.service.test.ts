import crypto from 'node:crypto'
import { OtpService } from '../otp.service'

describe('OtpService', () => {
  let sut: OtpService

  beforeEach(() => {
    sut = new OtpService()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('normalizeDestination', () => {
    it('should remove the country code from a Brazilian phone number', () => {
      expect(sut.normalizeDestination('+5562999824266')).toBe('62999824266')
    })

    it('should keep a phone number that is already normalized', () => {
      expect(sut.normalizeDestination('62999824266')).toBe('62999824266')
    })

    it('should remove phone number formatting', () => {
      expect(sut.normalizeDestination('(62) 99982-4266')).toBe('62999824266')
    })
  })

  describe('generateOtp', () => {
    it('should generate a six-digit code, hash and expiration', () => {
      const now = 1_700_000_000_000
      const randomNumbers = [0, 1, 2, 7, 8, 9]
      jest.spyOn(Date, 'now').mockReturnValue(now)
      const randomIntSpy = jest
        .spyOn(crypto, 'randomInt')
        .mockImplementation(() => randomNumbers.shift() as number)

      const otp = sut.generateOtp()
      const expectedHash = crypto
        .createHash('sha256')
        .update('012789')
        .digest('base64')

      expect(randomIntSpy).toHaveBeenCalledTimes(6)
      expect(randomIntSpy).toHaveBeenCalledWith(0, 10)
      expect(otp).toEqual({
        code: '012789',
        hash: expectedHash,
        expiresAt: new Date(now + 6 * 60 * 1000),
        expiresInSeconds: 6 * 60,
      })
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
