import { IsNull } from 'typeorm';
import {
  updateEntity,
  removeEntity,
  optionalIn,
  containsText,
} from '@/database/repository-utils';
import { DatabaseService } from '@/database/database.service';
import { Injectable, NotFoundException } from '@nestjs/common';

import { AppendDeviceFileDto } from '../dtos/append-device-file.dto';
import { DeviceFileType } from '@/database/entities';
import { FileService } from '@/common/files/file.service';

@Injectable()
export class DeviceFileService {
  constructor(
    private database: DatabaseService,
    private fileService: FileService,
  ) {}

  async appendFile(dto: AppendDeviceFileDto) {
    return this.database.deviceFile.save(
      this.database.deviceFile.create({
        deviceId: dto.deviceId,
        url: dto.fileUrl,
        type: dto.type,
        description: dto.description,
        active: true,
        index: dto.index,
        main: dto.main,
      }),
    );
  }

  async getFilesByDeviceId(deviceId: number) {
    return this.database.deviceFile.find({
      where: { deviceId, active: true, deletedAt: IsNull() },
      order: {
        index: 'asc',
      },
    });
  }

  async getMainFileByDeviceId(deviceId: number) {
    return this.database.deviceFile.findOne({
      where: { deviceId, active: true, main: true, deletedAt: IsNull() },
    });
  }

  updateFile(
    id: number,
    dto: {
      fileUrl: string;
      type: DeviceFileType;
      description: string;
      index: number;
      main: boolean;
    },
  ) {
    return updateEntity(
      this.database.deviceFile,
      { id },
      {
        url: dto.fileUrl,
        type: dto.type,
        description: dto.description,
        index: dto.index,
        main: dto.main,
      },
    );
  }

  async deleteFile(id: string) {
    const file = await this.database.deviceFile.findOne({
      where: { publicId: id, deletedAt: IsNull() },
    });
    if (!file) {
      throw new NotFoundException('File not found');
    }

    await updateEntity(
      this.database.deviceFile,
      { id: file.id },
      { active: false, deletedAt: new Date() },
    );

    this.fileService.deleteFile(file.url).catch((err) => {
      console.error(err);
    });
  }

  async updateDeviceFileIndexes(
    deviceId: string,
    files: { publicId: string; index: number }[],
  ) {
    const device = await this.database.device.findOne({
      where: { publicId: deviceId, deletedAt: IsNull() },
    });
    if (!device) {
      throw new NotFoundException('Device not found');
    }

    await Promise.all(
      files.map(async (file) => {
        await updateEntity(
          this.database.deviceFile,
          { publicId: file.publicId, deviceId: device.id },
          { index: file.index },
        );
      }),
    );
  }
}
