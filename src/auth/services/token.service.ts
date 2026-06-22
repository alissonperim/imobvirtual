import type { GenerateAccessTokenInput } from '../domain/session'
import crypto from 'node:crypto'
import jwt from 'jsonwebtoken'
import fs from 'node:fs'
import path from 'node:path'

export interface ITokenService {
  generate(params: GenerateAccessTokenInput): Promise<{ accessToken: string }>
  generateRefreshToken(): {
    refreshToken: string
    tokenHash: string
    expiresAt: Date
  }
  hashRefreshToken(refreshToken: string): string
}

export class TokenService implements ITokenService {
  async generate({
    clientId,
    role,
    sessionId,
  }: GenerateAccessTokenInput): Promise<{ accessToken: string }> {
    const nowInSeconds = Math.floor(Date.now() / 1000)
    const privateKeyPath = path.resolve(process.cwd(), 'private_key.pem')
    const pKey = fs.readFileSync(privateKeyPath)
    const token = jwt.sign(
      {
        sub: clientId,
        role,
        sid: sessionId,
        iss: 'imobvirtual-api',
        aud: 'imobvirtual-app',
        iat: nowInSeconds,
        exp: this.calculateExpiresIn(nowInSeconds),
      },
      pKey,
      { algorithm: 'RS256' },
    )
    return {
      accessToken: token,
    }
  }

  generateRefreshToken(): {
    refreshToken: string
    tokenHash: string
    expiresAt: Date
  } {
    const refreshToken = crypto.randomBytes(48).toString('base64url')

    return {
      refreshToken,
      tokenHash: this.hashRefreshToken(refreshToken),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    }
  }

  hashRefreshToken(refreshToken: string): string {
    return crypto.createHash('sha256').update(refreshToken).digest('base64url')
  }

  private calculateExpiresIn(generationTimeInSeconds: number): number {
    const secondsToExpire = 60 * 15

    return generationTimeInSeconds + secondsToExpire
  }
}
