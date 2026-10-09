import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    if (!request.user) {
      console.error(
        new Error(
          'Using User decorator without being authenticated: ' +
            request.method +
            ': ' +
            request.url,
        ),
      );
      throw new UnauthorizedException();
    }
    return request.user; // Return the user attached to the request
  },
);
