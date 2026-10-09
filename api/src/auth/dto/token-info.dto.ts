import { PermissionConfig, UserRole } from '@/common';

export interface TokenInfo {
  id: number;
  userId: string;
  name: string;
  lastname: string;
  role: UserRole;
  permissions: PermissionConfig;
}

export interface UserToken extends TokenInfo {}
