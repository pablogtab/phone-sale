import { IsNull } from 'typeorm';
import {
  updateEntity,
  removeEntity,
  optionalIn,
  containsText,
} from '@/database/repository-utils';
import { BadRequestException, Injectable } from '@nestjs/common';

import { CreateDeviceStorageSizeDto } from '../dtos/create-device-storage-size.dto';
import { UpdateDeviceStorageSizeDto } from '../dtos/update-device-storage-size.dto';
import { DeviceStorageSize } from '@/database/entities';
import { PublicDeviceStorageSizeDto } from '../dtos/public-device-storage-size.dto';
import { DatabaseService } from '@/database/database.service';

@Injectable()
export class DeviceStorageSizeService {
  constructor(private database: DatabaseService) {}

  async create(dto: CreateDeviceStorageSizeDto) {
    const exists = await this.existsSize(dto.size);
    if (exists) throw new BadRequestException('Size already exists');

    const last = await this.database.deviceStorageSize.findOne({
      where: { deletedAt: IsNull() },
      order: { index: 'desc' },
    });

    const index = last ? last.index + 1 : 1;

    const created = await this.database.deviceStorageSize.save(
      this.database.deviceStorageSize.create({ size: dto.size, index }),
    );

    return this.parseToPublicDto(created);
  }

  async findAll() {
    const sizes = await this.database.deviceStorageSize.find({
      where: { deletedAt: IsNull() },
      order: { index: 'desc' },
    });
    return sizes.map(this.parseToPublicDto);
  }

  async findOne(id: number) {
    const found = await this.database.deviceStorageSize.findOne({
      where: { id, deletedAt: IsNull() },
    });
    if (!found) throw new BadRequestException('Size not found');
    return this.parseToPublicDto(found);
  }

  async update(id: number, dto: UpdateDeviceStorageSizeDto) {
    const found = await this.findOne(id);

    if (dto.size) {
      const exists = await this.existsSize(dto.size);
      if (exists) throw new BadRequestException('Size already exists');
    }

    const updated = await updateEntity(
      this.database.deviceStorageSize,
      { id },
      { size: dto.size || found.size, active: dto.active ?? found.active },
    );

    return this.parseToPublicDto(updated);
  }

  async remove(id: number) {
    const found = await this.findOne(id);

    await updateEntity(
      this.database.deviceStorageSize,
      { id },
      { deletedAt: new Date() },
    );

    return found;
  }

  async updateIndexes(data: { id: number; index: number }[]) {
    await this.database.transaction((tx) =>
      Promise.all(
        data.map(({ id, index }) =>
          updateEntity(tx.deviceStorageSize, { id }, { index }),
        ),
      ),
    );
  }

  private async existsSize(size: string): Promise<boolean> {
    const exists = await this.database.deviceStorageSize.findOne({
      where: { size, deletedAt: IsNull() },
    });
    return !!exists;
  }

  private parseToPublicDto(obj: DeviceStorageSize): PublicDeviceStorageSizeDto {
    return {
      id: obj.id,
      size: obj.size,
      active: obj.active,
      createdAt: obj.createdAt,
      updatedAt: obj.updatedAt,
      index: obj.index,
    };
  }
}
