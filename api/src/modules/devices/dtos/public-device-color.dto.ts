import { DeviceColor } from '@/database/entities';

export type PublicDeviceColorDto = Omit<DeviceColor, 'deletedAt'>;
