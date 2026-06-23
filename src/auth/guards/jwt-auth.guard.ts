import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import jwt from 'jsonwebtoken'
import fs from 'node:fs'
import path from 'node:path'
import { IS_PUBLIC_KEY } from '../decorators/public.decorator'
import type { AccessToken } from '../domain/session'

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly publicKey: Buffer

  constructor(private readonly reflector: Reflector) {
    this.publicKey = fs.readFileSync(
      path.resolve(process.cwd(), 'public_key.pem'),
    )
  }

  canActivate(ctx: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ])

    if (isPublic) return true

    const request = ctx.switchToHttp().getRequest<{
      headers: { authorization?: string }
      user: AccessToken
    }>()

    const token = this.extractToken(request.headers.authorization)

    if (!token) throw new UnauthorizedException()

    try {
      request.user = jwt.verify(token, this.publicKey, {
        algorithms: ['RS256'],
        issuer: 'imobvirtual-api',
        audience: 'imobvirtual-app',
      }) as AccessToken
    } catch {
      throw new UnauthorizedException()
    }

    return true
  }

  private extractToken(authorizationHeader?: string): string | undefined {
    const [type, token] = authorizationHeader?.split(' ') ?? []
    return type === 'Bearer' ? token : undefined
  }
}
