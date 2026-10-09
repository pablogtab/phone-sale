import { DeviceStorageSize } from '@/database/entities';

export type PublicDeviceStorageSizeDto = Omit<DeviceStorageSize, 'deletedAt'>;
