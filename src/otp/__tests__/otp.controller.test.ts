import { EAccountRole, EOtpChannel, EOtpPurpose } from '@pkg/types'
import type { IRequestOtpUseCase } from '../use-cases/request-otp.use-case'
import { OtpController } from '../otp.controller'

describe('OtpController', () => {
  let requestOtpUseCase: jest.Mocked<IRequestOtpUseCase>
  let controller: OtpController

  beforeEach(() => {
    requestOtpUseCase = { execute: jest.fn() }
    controller = new OtpController(requestOtpUseCase)
  })

  it('should delegate OTP requests with their purpose', async () => {
    const input = {
      phoneNumber: '+5562999824266',
      channel: EOtpChannel.SMS,
      purpose: EOtpPurpose.SIGN_UP,
      role: EAccountRole.RENTER,
    }
    const output = {
      otpChallengeId: 'otp-id',
      expiresIn: 360,
      purpose: EOtpPurpose.SIGN_UP,
      code: '123456',
    }
    requestOtpUseCase.execute.mockResolvedValue(output)

    await expect(controller.requestOtp(input)).resolves.toEqual(output)
    expect(requestOtpUseCase.execute).toHaveBeenCalledWith(input)
  })
})
