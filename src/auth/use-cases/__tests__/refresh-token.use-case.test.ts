/* eslint-disable @typescript-eslint/unbound-method */
import { UnauthorizedException } from '@nestjs/common'
import type { IAccountsRepository } from '@app/accounts/repositories/domain'
import { EAccountRole, EAccountStatus, type Account } from '@pkg/types'
import type { IRefreshTokenSessionsRepository } from '../../repositories/session.domain'
import type { ITokenService } from '../../services/token.service'
import { RefreshTokenUseCase } from '../refresh-token.use-case'

describe('RefreshTokenUseCase', () => {
  let sessionsRepository: jest.Mocked<IRefreshTokenSessionsRepository>
  let tokenService: jest.Mocked<ITokenService>
  let accountsRepository: jest.Mocked<IAccountsRepository>
  let sut: RefreshTokenUseCase

  const account: Account = {
    id: 'account-id',
    role: EAccountRole.OWNER,
    phoneNumber: '5562900000000',
    status: EAccountStatus.ACTIVE,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  }

  const session = {
    id: 'session-id',
    accountId: account.id,
    tokenHash: 'current-hash',
    expiresAt: new Date('2026-07-01T00:00:00.000Z'),
    createdAt: new Date('2026-06-01T00:00:00.000Z'),
    updatedAt: new Date('2026-06-01T00:00:00.000Z'),
  }

  beforeEach(() => {
    sessionsRepository = {
      create: jest.fn(),
      findActiveByTokenHash: jest.fn(),
      rotate: jest.fn(),
      revoke: jest.fn(),
    }
    tokenService = {
      generate: jest.fn(),
      generateRefreshToken: jest.fn(),
      hashRefreshToken: jest.fn(),
    }
    accountsRepository = {
      create: jest.fn(),
      getByDestination: jest.fn(),
      getById: jest.fn(),
    }
    sut = new RefreshTokenUseCase(
      sessionsRepository,
      tokenService,
      accountsRepository,
    )
  })

  it('should rotate the refresh token and return a new token pair', async () => {
    tokenService.hashRefreshToken.mockReturnValue('current-hash')
    sessionsRepository.findActiveByTokenHash.mockResolvedValue(session)
    accountsRepository.getById.mockResolvedValue(account)
    tokenService.generateRefreshToken.mockReturnValue({
      refreshToken: 'new-refresh-token',
      tokenHash: 'new-hash',
      expiresAt: new Date('2026-08-01T00:00:00.000Z'),
    })
    sessionsRepository.rotate.mockResolvedValue(true)
    tokenService.generate.mockResolvedValue({ accessToken: 'new-access-token' })

    const result = await sut.execute({ refreshToken: 'current-token' })

    expect(sessionsRepository.rotate).toHaveBeenCalledWith(
      session.id,
      'current-hash',
      'new-hash',
      new Date('2026-08-01T00:00:00.000Z'),
    )
    expect(tokenService.generate).toHaveBeenCalledWith({
      clientId: account.id,
      role: account.role,
      sessionId: session.id,
    })
    expect(result).toEqual({
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
    })
  })

  it('should reject an invalid refresh token', async () => {
    tokenService.hashRefreshToken.mockReturnValue('invalid-hash')
    sessionsRepository.findActiveByTokenHash.mockResolvedValue(undefined)

    await expect(
      sut.execute({ refreshToken: 'invalid-token' }),
    ).rejects.toThrow(new UnauthorizedException('Invalid refresh token'))

    expect(accountsRepository.getById).not.toHaveBeenCalled()
    expect(sessionsRepository.rotate).not.toHaveBeenCalled()
  })

  it('should revoke the session when the account is not active', async () => {
    tokenService.hashRefreshToken.mockReturnValue('current-hash')
    sessionsRepository.findActiveByTokenHash.mockResolvedValue(session)
    accountsRepository.getById.mockResolvedValue({
      ...account,
      status: EAccountStatus.BLOCKED,
    })

    await expect(
      sut.execute({ refreshToken: 'current-token' }),
    ).rejects.toThrow(new UnauthorizedException('Account is not active'))

    expect(sessionsRepository.revoke).toHaveBeenCalledWith(session.id)
    expect(sessionsRepository.rotate).not.toHaveBeenCalled()
  })
})
