import { DeviceModel } from '@/database/entities';

export type PublicDeviceModelDto = Omit<DeviceModel, 'deletedAt'> & {
  availableColors?: { id: number; name: string; hex: string }[];
  availableStorageSizes?: { id: number; size: number }[];
};
