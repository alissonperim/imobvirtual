import { UnauthorizedException } from '@nestjs/common'
import crypto from 'node:crypto'
import { EOtpChannel, EOtpPurpose, type Otp } from '@pkg/types'
import type { IOtpRepository } from '../../repository/otp.domain'
import { OtpService } from '../otp.service'

describe('OtpService', () => {
  let repository: jest.Mocked<IOtpRepository>
  let sut: OtpService

  const otpChallenge: Otp = {
    id: 'otp-id',
    destination: '62999824266',
    purpose: EOtpPurpose.SIGN_UP,
    channel: EOtpChannel.SMS,
    codeHash: crypto.createHash('sha256').update('123456').digest('base64'),
    expiresAt: new Date('2026-01-01T00:15:00.000Z'),
    attempts: 0,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  }

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      consumeActiveByAccountId: jest.fn(),
      findActiveById: jest.fn(),
      incrementAttempts: jest.fn(),
      consume: jest.fn(),
    }
    sut = new OtpService(repository)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('validate', () => {
    it('should consume the challenge when the OTP is valid', async () => {
      repository.findActiveById.mockResolvedValue(otpChallenge)

      await sut.validate({ otp: '123456', otpId: otpChallenge.id })

      expect(repository.findActiveById).toHaveBeenCalledWith(otpChallenge.id)
      expect(repository.consume).toHaveBeenCalledWith(otpChallenge.id)
      expect(repository.incrementAttempts).not.toHaveBeenCalled()
    })

    it('should reject when the challenge is not active', async () => {
      repository.findActiveById.mockResolvedValue(undefined)

      await expect(
        sut.validate({ otp: '123456', otpId: 'missing-id' }),
      ).rejects.toThrow(new UnauthorizedException('Invalid OTP'))

      expect(repository.consume).not.toHaveBeenCalled()
      expect(repository.incrementAttempts).not.toHaveBeenCalled()
    })

    it('should reject a challenge that already has an account bound to it', async () => {
      repository.findActiveById.mockResolvedValue({
        ...otpChallenge,
        accountId: 'account-id',
      })

      await expect(
        sut.validate({ otp: '123456', otpId: otpChallenge.id }),
      ).rejects.toThrow(new UnauthorizedException('Invalid OTP'))
    })

    it('should consume and reject a challenge at the attempt limit', async () => {
      repository.findActiveById.mockResolvedValue({
        ...otpChallenge,
        attempts: 3,
      })

      await expect(
        sut.validate({ otp: '123456', otpId: otpChallenge.id }),
      ).rejects.toThrow(new UnauthorizedException('Invalid OTP'))

      expect(repository.consume).toHaveBeenCalledWith(otpChallenge.id)
    })

    it('should increment attempts and reject an invalid OTP', async () => {
      repository.findActiveById.mockResolvedValue(otpChallenge)

      await expect(
        sut.validate({ otp: '654321', otpId: otpChallenge.id }),
      ).rejects.toThrow(new UnauthorizedException('Invalid OTP'))

      expect(repository.incrementAttempts).toHaveBeenCalledWith(
        otpChallenge.id,
      )
      expect(repository.consume).not.toHaveBeenCalled()
    })
  })

  describe('createOtp', () => {
    it('should generate a six-digit code, hash and expiration, then persist it', async () => {
      const now = 1_700_000_000_000
      const randomNumbers = [0, 1, 2, 7, 8, 9]
      jest.spyOn(Date, 'now').mockReturnValue(now)
      const randomIntSpy = jest
        .spyOn(crypto, 'randomInt')
        .mockImplementation(() => randomNumbers.shift() as number)
      const createdOtp: Otp = { ...otpChallenge, id: 'created-otp-id' }
      repository.create.mockResolvedValue(createdOtp)

      const result = await sut.createOtp({
        destination: '62999824266',
        channel: EOtpChannel.SMS,
        purpose: EOtpPurpose.SIGN_UP,
      })

      const expectedHash = crypto
        .createHash('sha256')
        .update('012789')
        .digest('base64')

      expect(randomIntSpy).toHaveBeenCalledTimes(6)
      expect(randomIntSpy).toHaveBeenCalledWith(0, 10)
      expect(repository.create).toHaveBeenCalledWith({
        accountId: undefined,
        destination: '62999824266',
        channel: EOtpChannel.SMS,
        codeHash: expectedHash,
        expiresAt: new Date(now + 6 * 60 * 1000),
        purpose: EOtpPurpose.SIGN_UP,
      })
      expect(result).toEqual({
        code: '012789',
        hash: expectedHash,
        expiresAt: new Date(now + 6 * 60 * 1000),
        expiresInSeconds: 6 * 60,
        otpId: 'created-otp-id',
        purpose: createdOtp.purpose,
      })
    })

    it('should forward the accountId when creating an OTP for an existing account', async () => {
      repository.create.mockResolvedValue(otpChallenge)

      await sut.createOtp({
        accountId: 'account-id',
        destination: '62999824266',
        channel: EOtpChannel.WHATSAPP,
        purpose: EOtpPurpose.SIGN_IN,
      })

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({ accountId: 'account-id' }),
      )
    })
  })
})
