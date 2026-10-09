export type UserRole = 'admin' | 'user';

export type PermissionActions = 'read' | 'write' | 'admin_read' | 'admin_write';

export const PERMISSIONS = {
  users: 'users',
  banks: 'banks',
  providers: 'providers',
  cash_accounts: 'cash_accounts',
  accounting_accounts: 'accounting_accounts',
  clients: 'clients',
} as const;

export type PermissionType = keyof typeof PERMISSIONS;

export type PermissionConfig = {
  [key in PermissionType]?: PermissionActions[];
};
