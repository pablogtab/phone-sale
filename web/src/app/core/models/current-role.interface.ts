import { UserRole, PermissionConfig } from '../permissions';

export interface CurrentRole {
    role?: UserRole;
    permissions?: PermissionConfig;
}
