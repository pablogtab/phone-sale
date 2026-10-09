import { IsPublic } from '@/common/decorators/is-public.decorator';
import { TokenService } from '@/auth/token.service';
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly tokenService: TokenService,
    private reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublicResource = this.reflector.get<boolean>(
      IsPublic,
      context.getHandler(),
    );

    if (isPublicResource) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    return this.validateRequest(request);
  }

  validateRequest(request: any): boolean {
    const bearer = request.headers.authorization;

    if (!bearer) {
      throw new UnauthorizedException();
    }

    const token = bearer.split(' ')[1];

    if (!token) {
      throw new UnauthorizedException();
    }

    const verified = this.tokenService.verifyToken(token);

    if (verified) {
      request.user = verified;
      return true;
    }

    throw new UnauthorizedException();
  }
}
