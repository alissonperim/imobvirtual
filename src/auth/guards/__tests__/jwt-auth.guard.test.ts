import { ExecutionContext, UnauthorizedException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { JwtAuthGuard } from '../jwt-auth.guard'
import jwt from 'jsonwebtoken'
import { EAccountRole } from '@pkg/types'

jest.mock('node:fs', () => ({
  readFileSync: jest.fn().mockReturnValue('mock-public-key'),
}))

jest.mock('jsonwebtoken')

const makeContext = (
  authHeader?: string,
  handler = jest.fn(),
  controller = jest.fn(),
) =>
  ({
    getHandler: () => handler,
    getClass: () => controller,
    switchToHttp: () => ({
      getRequest: () => ({
        headers: { authorization: authHeader },
        user: undefined,
      }),
    }),
  }) as unknown as ExecutionContext

describe('JwtAuthGuard', () => {
  let reflector: jest.Mocked<Reflector>
  let guard: JwtAuthGuard

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    } as unknown as jest.Mocked<Reflector>
    guard = new JwtAuthGuard(reflector)
  })

  it('should allow access to public routes without a token', () => {
    reflector.getAllAndOverride.mockReturnValue(true)

    const result = guard.canActivate(makeContext())

    expect(result).toBe(true)
  })

  it('should throw when Authorization header is missing', () => {
    reflector.getAllAndOverride.mockReturnValue(false)

    expect(() => guard.canActivate(makeContext())).toThrow(
      UnauthorizedException,
    )
  })

  it('should throw when the token is not a Bearer token', () => {
    reflector.getAllAndOverride.mockReturnValue(false)

    expect(() => guard.canActivate(makeContext('Basic abc123'))).toThrow(
      UnauthorizedException,
    )
  })

  it('should throw when jwt.verify rejects the token', () => {
    reflector.getAllAndOverride.mockReturnValue(false)
    ;(jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error('invalid signature')
    })

    expect(() => guard.canActivate(makeContext('Bearer bad-token'))).toThrow(
      UnauthorizedException,
    )
  })

  it('should attach decoded claims to request.user on valid token', () => {
    const claims = {
      sub: 'account-id',
      role: EAccountRole.OWNER,
      sid: 'session-id',
      iss: 'imobvirtual-api',
      aud: 'imobvirtual-app',
      iat: 1000,
      exp: 1900,
    }
    reflector.getAllAndOverride.mockReturnValue(false)
    ;(jwt.verify as jest.Mock).mockReturnValue(claims)

    const request = {
      headers: { authorization: 'Bearer valid-token' },
      user: undefined,
    }
    const ctx = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext

    const result = guard.canActivate(ctx)

    expect(result).toBe(true)
    expect(request.user).toEqual(claims)
  })
})
