import { EAccountRole } from '@pkg/types'
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import jwt from 'jsonwebtoken'
import { TokenService } from '../token-service'

describe('TokenService', () => {
  let sut: TokenService

  beforeEach(() => {
    sut = new TokenService()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('generate', () => {
    it('should generate an RS256 access token with the expected claims', async () => {
      const generationTimeInMilliseconds = 1_700_000_000_000
      const generationTimeInSeconds = 1_700_000_000
      const sessionId = '123e4567-e89b-12d3-a456-426614174000'
      const privateKey = Buffer.from('private-key')
      const privateKeyPath = path.resolve(process.cwd(), 'private_key.pem')

      jest.spyOn(Date, 'now').mockReturnValue(generationTimeInMilliseconds)
      jest.spyOn(crypto, 'randomUUID').mockReturnValue(sessionId)
      const readFileSpy = jest
        .spyOn(fs, 'readFileSync')
        .mockReturnValue(privateKey)
      const signSpy = jest
        .spyOn(jwt, 'sign')
        .mockImplementation(() => 'signed-access-token')

      const result = await sut.generate({
        clientId: 'account-id',
        role: EAccountRole.OWNER,
      })

      expect(readFileSpy).toHaveBeenCalledWith(privateKeyPath)
      expect(signSpy).toHaveBeenCalledWith(
        {
          sub: 'account-id',
          role: EAccountRole.OWNER,
          sid: sessionId,
          iss: 'imobvirtual-api',
          aud: 'imobvirtual-app',
          iat: generationTimeInSeconds,
          exp: generationTimeInSeconds + 15 * 60,
        },
        privateKey,
        { algorithm: 'RS256' },
      )
      expect(result).toEqual({ accessToken: 'signed-access-token' })
    })

    it('should reject when the private key cannot be read', async () => {
      jest.spyOn(fs, 'readFileSync').mockImplementation(() => {
        throw new Error('Private key not found')
      })

      await expect(
        sut.generate({
          clientId: 'account-id',
          role: EAccountRole.RENTER,
        }),
      ).rejects.toThrow('Private key not found')
    })
  })
})
