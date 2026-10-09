import {
  HasPermission,
  PermissionRequirement,
} from '@/common/decorators/has-permission.decorator';
import { UserToken } from '@/auth/dto/token-info.dto';
import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { AuthGuard } from './auth.guard';

@Injectable()
export class PermissionGuard {
  constructor(
    private authGuard: AuthGuard,
    private reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const requirements = this.reflector.get(
      HasPermission,
      context.getHandler(),
    ) as PermissionRequirement[];
    if (!requirements) return true;

    const request = context.switchToHttp().getRequest();
    let user: UserToken = request.user;

    if (!user) {
      // If the user is not authenticated, we need to validate the request, like the AuthGuard does
      const can = this.authGuard.validateRequest(request);
      if (!can || !request.user) {
        throw new UnauthorizedException();
      }
      user = request.user;
    }

    return this.checkRequirements(user, requirements);
  }

  checkRequirements(
    user: UserToken,
    requirements: PermissionRequirement[],
  ): boolean {
    if (!user) throw new UnauthorizedException();
    if (user.role === 'admin') return true;

    const permissions = user.permissions;

    for (const requirement of requirements) {
      const module = permissions[requirement.module];
      if (!module)
        throw new ForbiddenException(
          `You don't have permission to access this resource '${requirement.module}'`,
        );

      const actions = Array.isArray(requirement.actions)
        ? requirement.actions
        : [requirement.actions];
      for (const action of actions) {
        if (!module.includes(action))
          throw new ForbiddenException(
            `You don't have permission to perform this action '${requirement.module}:${action}'`,
          );
      }
    }

    return true;
  }
}
