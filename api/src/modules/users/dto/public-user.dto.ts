import { UserRole } from '@/common';
import { JsonValue } from '@/database/entities';

export interface PublicUserDto {
  publicId: string;
  name: string;
  lastname: string;
  role: UserRole;
  profilePicture?: string;
  permissions: JsonValue;
}
