import {
  Device,
  DeviceColor,
  DeviceFile,
  DeviceModel,
  DeviceStorageSize,
  Provider,
} from '@/database/entities';

export interface DetailedDeviceDto extends Omit<Device, 'testedByUser'> {
  color: DeviceColor;
  storageSize: DeviceStorageSize;
  model: DeviceModel;
  originProvider?: Provider;
  mainPhotoUrl: string;
  testedByUser: string;
  aditionalFiles: DeviceFile[];
}
