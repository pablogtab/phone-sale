import { ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionGuard } from './permission.guard';
import { UserToken } from '../dto/token-info.dto';

describe('permission boundaries', () => {
  const guard = new PermissionGuard({} as never, new Reflector());
  const user = {
    role: 'user',
    permissions: { clients: ['read'] },
  } as UserToken;
  it('allows assigned actions', () => {
    expect(
      guard.checkRequirements(user, [{ module: 'clients', actions: 'read' }]),
    ).toBe(true);
  });
  it('rejects missing actions and missing modules', () => {
    expect(() =>
      guard.checkRequirements(user, [
        { module: 'clients', actions: 'admin_write' },
      ]),
    ).toThrow(ForbiddenException);
    expect(() =>
      guard.checkRequirements(user, [{ module: 'users', actions: 'read' }]),
    ).toThrow(ForbiddenException);
  });
  it('allows the administrator', () => {
    expect(
      guard.checkRequirements({ ...user, role: 'admin' }, [
        { module: 'users', actions: 'admin_write' },
      ]),
    ).toBe(true);
  });
});
