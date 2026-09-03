import { BadRequestException } from '@nestjs/common'
import {
  EAccountRole,
  EAccountStatus,
  EOtpChannel,
  EOtpPurpose,
  type Otp,
  type Owner,
  type Renter,
} from '@pkg/types'
import type { ITransactionManager } from '@app/database/transaction/domain'
import type {
  IOwnerService,
  OwnerService,
} from '@app/owners/services/owner.service'
import type {
  IRenterService,
  RenterService,
} from '@app/renters/services/renter.service'
import type { IAccountsRepository } from '../../repositories/domain'
import { AccountService } from '../register.service'
import type { AccountsRepository } from '../../repositories/implementations/accounts.repository'

describe('AccountService', () => {
  let ownerService: jest.Mocked<IOwnerService>
  let renterService: jest.Mocked<IRenterService>
  let accountsRepository: jest.Mocked<IAccountsRepository>
  let transactionManager: jest.Mocked<ITransactionManager>
  let sut: AccountService

  const otp: Otp = {
    id: 'otp-id',
    destination: '62999999999',
    purpose: EOtpPurpose.SIGN_UP,
    channel: EOtpChannel.SMS,
    codeHash: 'hash',
    expiresAt: new Date('2026-01-01T00:15:00.000Z'),
    attempts: 0,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  }

  const owner: Owner = {
    id: 'owner-id',
    name: 'John',
    lastName: 'Doe',
    document: '12345678900',
    phoneNumber: '62999999999',
    properties: [],
    maritalStatus: undefined as never,
    accountId: 'account-id',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  }

  const renter: Renter = {
    id: 'renter-id',
    name: 'Maria',
    lastName: 'Silva',
    document: '98765432100',
    phoneNumber: '62999999998',
    email: 'maria@silva.com',
    accountId: 'renter-account-id',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  }

  beforeEach(() => {
    ownerService = { register: jest.fn() }
    renterService = { register: jest.fn() }
    accountsRepository = {
      create: jest.fn(),
      createPendingRegistrationUser: jest.fn(),
      deletePendingRegistrationUser: jest.fn(),
      list: jest.fn(),
      getById: jest.fn(),
      getPendingRegistrationAccount: jest.fn(),
    }
    transactionManager = {
      run: jest.fn().mockImplementation((work: () => unknown) => work()),
    }
    sut = new AccountService(
      ownerService as unknown as OwnerService,
      renterService as unknown as RenterService,
      accountsRepository as unknown as AccountsRepository,
      transactionManager,
    )
  })

  describe('register', () => {
    it('should create the owner and delete the pending registration inside one transaction', async () => {
      accountsRepository.getPendingRegistrationAccount.mockResolvedValue({
        email: 'john@doe.com',
        phoneNumber: '62999999999',
        name: 'John',
        lastName: 'Doe',
        role: EAccountRole.OWNER,
        otpId: otp.id,
      })
      ownerService.register.mockResolvedValue(owner)

      const result = await sut.register(otp)

      expect(transactionManager.run).toHaveBeenCalledTimes(1)
      expect(ownerService.register).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'John',
          lastName: 'Doe',
          email: 'john@doe.com',
          phoneNumber: '62999999999',
          account: { otps: [otp], role: EAccountRole.OWNER },
        }),
      )
      expect(
        accountsRepository.deletePendingRegistrationUser,
      ).toHaveBeenCalledWith(otp.id)
      expect(result).toEqual({
        owner,
        id: owner.accountId,
        role: EAccountRole.OWNER,
        status: EAccountStatus.ACTIVE,
      })
    })

    it('should create the renter and delete the pending registration inside one transaction', async () => {
      accountsRepository.getPendingRegistrationAccount.mockResolvedValue({
        email: 'maria@silva.com',
        phoneNumber: '62999999998',
        name: 'Maria',
        lastName: 'Silva',
        role: EAccountRole.RENTER,
        otpId: otp.id,
      })
      renterService.register.mockResolvedValue(renter)

      const result = await sut.register(otp)

      expect(transactionManager.run).toHaveBeenCalledTimes(1)
      expect(renterService.register).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Maria',
          lastName: 'Silva',
          account: { role: EAccountRole.RENTER, otps: [otp] },
        }),
      )
      expect(
        accountsRepository.deletePendingRegistrationUser,
      ).toHaveBeenCalledWith(otp.id)
      expect(result).toEqual({
        renter,
        id: renter.accountId,
        role: EAccountRole.RENTER,
        status: EAccountStatus.ACTIVE,
      })
    })

    it('should not open a transaction nor touch the pending registration when the role is invalid', async () => {
      accountsRepository.getPendingRegistrationAccount.mockResolvedValue({
        email: 'john@doe.com',
        phoneNumber: '62999999999',
        name: 'John',
        lastName: 'Doe',
        role: 'INVALID' as EAccountRole,
        otpId: otp.id,
      })

      await expect(sut.register(otp)).rejects.toThrow(
        new BadRequestException('Role not valid to create new account'),
      )

      expect(transactionManager.run).not.toHaveBeenCalled()
      expect(
        accountsRepository.deletePendingRegistrationUser,
      ).not.toHaveBeenCalled()
    })

    it('should not delete the pending registration when owner creation fails inside the transaction', async () => {
      accountsRepository.getPendingRegistrationAccount.mockResolvedValue({
        email: 'john@doe.com',
        phoneNumber: '62999999999',
        name: 'John',
        lastName: 'Doe',
        role: EAccountRole.OWNER,
        otpId: otp.id,
      })
      ownerService.register.mockRejectedValue(new Error('insert failed'))

      await expect(sut.register(otp)).rejects.toThrow('insert failed')

      expect(
        accountsRepository.deletePendingRegistrationUser,
      ).not.toHaveBeenCalled()
    })
  })
})
