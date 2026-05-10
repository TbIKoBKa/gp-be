import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export interface UserPayload {
  nickname: string;
  uuid: string;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedRequest extends Request {
  user: UserPayload;
}

/**
 * Decorator to extract the current user from request.
 * Use with JwtAuthGuard (required) or OptionalJwtAuthGuard (optional).
 *
 * @example
 * // Required user (throws if not authenticated)
 * @UseGuards(JwtAuthGuard)
 * @Get('profile')
 * getProfile(@CurrentUser() user: UserPayload) {}
 *
 * @example
 * // Optional user (undefined if not authenticated)
 * @UseGuards(OptionalJwtAuthGuard)
 * @Post('order')
 * createOrder(@CurrentUser() user?: UserPayload) {}
 */
export const CurrentUser = createParamDecorator(
  (data: keyof UserPayload | undefined, ctx: ExecutionContext): UserPayload | UserPayload[keyof UserPayload] | undefined => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    if (!user) {
      return undefined;
    }

    return data ? user[data] : user;
  },
);
