import { DeviceFileType } from '@/database/entities';

export class AppendDeviceFileDto {
  deviceId: number;
  fileUrl: string;
  type: DeviceFileType;
  description: string;
  main: boolean;
  index: number;
}
