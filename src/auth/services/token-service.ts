import type { GenerateAccessTokenInput } from '../domain/token'
import { randomUUID as uuid } from 'node:crypto'
import jwt from 'jsonwebtoken'
import fs from 'node:fs'
import path from 'node:path'

export interface ITokenService {
  generate(params: GenerateAccessTokenInput): Promise<{ accessToken: string }>
}

export class TokenService implements ITokenService {
  async generate({
    clientId,
    role,
  }: GenerateAccessTokenInput): Promise<{ accessToken: string }> {
    const nowInSeconds = Math.floor(Date.now() / 1000)
    const privateKeyPath = path.resolve(process.cwd(), 'private_key.pem')
    const pKey = fs.readFileSync(privateKeyPath)
    const token = jwt.sign(
      {
        sub: clientId,
        role,
        sid: uuid(),
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

  private calculateExpiresIn(generationTimeInSeconds: number): number {
    const secondsToExpire = 60 * 15

    return generationTimeInSeconds + secondsToExpire
  }
}
