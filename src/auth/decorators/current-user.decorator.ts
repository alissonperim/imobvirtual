import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import type { AccessToken } from '../domain/session'

export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): AccessToken => {
    const request = ctx.switchToHttp().getRequest()
    return request.user as AccessToken
  },
)
