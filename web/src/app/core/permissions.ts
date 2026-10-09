export type UserRole = 'admin' | 'user';

export const ROLES = {
    admin: 'admin',
    user: 'user',
};

export type PermissionActions = 'read' | 'write' | 'admin_read' | 'admin_write';

export const PERMISSION_ACTIONS = {
    read: 'read',
    write: 'write',
    admin_read: 'admin_read',
    admin_write: 'admin_write',
} as const;
export const PERMISSIONS = {
    users: 'users',
    banks: 'banks',
    providers: 'providers',
    cash_accounts: 'cash_accounts',
    accounting_accounts: 'accounting_accounts',
    clients: 'clients',
} as const;

export type Permissions = {
    [key in keyof typeof PERMISSIONS]: string[];
};

export type PermissionType = keyof typeof PERMISSIONS;

export type PermissionConfig = {
    [key in PermissionType]?: PermissionActions[];
};
