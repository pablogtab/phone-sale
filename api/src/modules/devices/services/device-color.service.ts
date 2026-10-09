import { IsNull } from 'typeorm';
import {
  updateEntity,
  removeEntity,
  optionalIn,
  containsText,
} from '@/database/repository-utils';
import { BadRequestException, Injectable } from '@nestjs/common';

import { CreateDeviceColorDto } from '../dtos/create-device-color.dto';
import { UpdateDeviceColorDto } from '../dtos/update-device-color.dto';
import { DatabaseService } from '@/database/database.service';
import { PublicDeviceColorDto } from '../dtos/public-device-color.dto';
import { DeviceColor } from '@/database/entities';

@Injectable()
export class DeviceColorService {
  constructor(private database: DatabaseService) {}

  async create(dto: CreateDeviceColorDto): Promise<PublicDeviceColorDto> {
    const exists = await this.colorNameAlreadyExists(dto.name);

    if (exists) throw new BadRequestException('Color name already exists');

    const created = await this.database.deviceColor.save(
      this.database.deviceColor.create({ name: dto.name, hex: dto.hex }),
    );

    return this.parseToPublicDto(created);
  }

  async findAll() {
    const colors = await this.database.deviceColor.find({
      where: { deletedAt: IsNull() },
    });
    return colors.map(this.parseToPublicDto);
  }

  async findOne(id: number) {
    const color = await this.database.deviceColor.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!color) throw new BadRequestException('Color not found');

    return color;
  }

  async update(id: number, dto: UpdateDeviceColorDto) {
    const color = await this.findOne(id);

    if (dto.name) {
      const exists = await this.colorNameAlreadyExists(dto.name);
      if (exists) throw new BadRequestException('Color name already exists');
    }

    const updated = await updateEntity(
      this.database.deviceColor,
      { id },
      {
        name: dto.name || color.name,
        hex: dto.hex || color.hex,
        active: dto.active ?? color.active,
      },
    );

    return this.parseToPublicDto(updated);
  }

  async remove(id: number) {
    const color = await this.findOne(id);
    if (!color) throw new BadRequestException('Color not found');

    await updateEntity(
      this.database.deviceColor,
      { id },
      { deletedAt: new Date() },
    );
  }

  async colorNameAlreadyExists(color: string) {
    const exists = await this.database.deviceColor.findOne({
      where: { name: color, deletedAt: IsNull() },
    });

    return exists;
  }

  private parseToPublicDto(color: DeviceColor) {
    return {
      id: color.id,
      name: color.name,
      hex: color.hex,
      createdAt: color.createdAt,
      updatedAt: color.updatedAt,
      active: color.active,
    };
  }
}
