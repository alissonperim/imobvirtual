import { BadRequestException, ConflictException } from '@nestjs/common'
import type { IAccountService } from '@app/accounts/services/register.service'
import {
  EAccountRole,
  EAccountStatus,
  EOtpChannel,
  EOtpPurpose,
  type Account,
} from '@pkg/types'
import type { IOtpService } from '../../services/otp.service'
import { RequestOtpUseCase } from '../request-otp.use-case'

describe('RequestOtpUseCase', () => {
  let otpService: jest.Mocked<IOtpService>
  let accountService: jest.Mocked<IAccountService>
  let sut: RequestOtpUseCase

  const account: Account = {
    id: 'account-id',
    role: EAccountRole.OWNER,
    status: EAccountStatus.ACTIVE,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  }

  beforeEach(() => {
    otpService = {
      getAndValidate: jest.fn(),
      createOtp: jest.fn(),
    }
    accountService = {
      register: jest.fn(),
      getAccount: jest.fn(),
      createPendingRegistrationUser: jest.fn(),
    }
    sut = new RequestOtpUseCase(otpService, accountService)
  })

  it('should create a sign-in challenge linked to an existing account without a pending registration', async () => {
    accountService.getAccount.mockResolvedValue(account)
    otpService.createOtp.mockResolvedValue({
      code: '123456',
      hash: 'otp-hash',
      expiresAt: new Date('2026-01-01T00:15:00.000Z'),
      expiresInSeconds: 360,
      otpId: 'otp-challenge-id',
      purpose: EOtpPurpose.SIGN_IN,
    })

    const result = await sut.execute({
      phoneNumber: '62999824266',
      channel: EOtpChannel.SMS,
      purpose: EOtpPurpose.SIGN_IN,
      role: EAccountRole.OWNER,
    })

    expect(accountService.getAccount).toHaveBeenCalledWith({
      phoneNumber: '62999824266',
      role: EAccountRole.OWNER,
    })
    expect(otpService.createOtp).toHaveBeenCalledWith({
      channel: EOtpChannel.SMS,
      destination: '62999824266',
      purpose: EOtpPurpose.SIGN_IN,
      accountId: account.id,
    })
    expect(accountService.createPendingRegistrationUser).not.toHaveBeenCalled()
    expect(result).toEqual({
      otpChallengeId: 'otp-challenge-id',
      expiresIn: 360,
      purpose: EOtpPurpose.SIGN_IN,
      code: '123456',
    })
  })

  it('should create a sign-up challenge without an account and register the pending user', async () => {
    accountService.getAccount.mockResolvedValue(undefined as unknown as Account)
    otpService.createOtp.mockResolvedValue({
      code: '123456',
      hash: 'otp-hash',
      expiresAt: new Date('2026-01-01T00:15:00.000Z'),
      expiresInSeconds: 360,
      otpId: 'otp-challenge-id',
      purpose: EOtpPurpose.SIGN_UP,
    })

    const result = await sut.execute({
      phoneNumber: '62999824266',
      channel: EOtpChannel.WHATSAPP,
      purpose: EOtpPurpose.SIGN_UP,
      role: EAccountRole.RENTER,
      name: 'Maria',
      lastName: 'Silva',
      email: 'maria@silva.com',
    })

    expect(otpService.createOtp).toHaveBeenCalledWith(
      expect.objectContaining({
        accountId: undefined,
        destination: '62999824266',
        purpose: EOtpPurpose.SIGN_UP,
      }),
    )
    expect(accountService.createPendingRegistrationUser).toHaveBeenCalledWith({
      email: 'maria@silva.com',
      phoneNumber: '62999824266',
      name: 'Maria',
      lastName: 'Silva',
      role: EAccountRole.RENTER,
      otpId: 'otp-challenge-id',
    })
    expect(result.purpose).toBe(EOtpPurpose.SIGN_UP)
  })

  it('should reject sign-in when the account does not exist', async () => {
    accountService.getAccount.mockResolvedValue(undefined as unknown as Account)

    await expect(
      sut.execute({
        phoneNumber: '62999824266',
        channel: EOtpChannel.SMS,
        purpose: EOtpPurpose.SIGN_IN,
        role: EAccountRole.OWNER,
      }),
    ).rejects.toThrow(new BadRequestException('Account not found'))

    expect(otpService.createOtp).not.toHaveBeenCalled()
  })

  it('should reject sign-up when the account already exists', async () => {
    accountService.getAccount.mockResolvedValue(account)

    await expect(
      sut.execute({
        phoneNumber: '62999824266',
        channel: EOtpChannel.SMS,
        purpose: EOtpPurpose.SIGN_UP,
        role: EAccountRole.OWNER,
      }),
    ).rejects.toThrow(new ConflictException('Account already exists'))

    expect(otpService.createOtp).not.toHaveBeenCalled()
  })
})
