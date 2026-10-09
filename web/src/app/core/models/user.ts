import { PermissionConfig, UserRole } from '../permissions';

export interface User {
    id: number;
    publicId: string;
    name: string;
    lastname: string;
    role: UserRole;
    profilePicture?: string;
    createdAt?: Date;
    updatedAt?: Date;
    permissions?: PermissionConfig;
    password?: string;
    username?: string;
}
