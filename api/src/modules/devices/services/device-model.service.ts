import { IsNull } from 'typeorm';
import {
  updateEntity,
  removeEntity,
  optionalIn,
  containsText,
} from '@/database/repository-utils';
import { DatabaseService } from '@/database/database.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { DeviceModel } from '@/database/entities';

import { CreateDeviceModelDto } from '../dtos/create-device-model.dto';
import { PublicDeviceModelDto } from '../dtos/public-device-model.dto';
import { UpdateDeviceModelDto } from '../dtos/update-device-model.dto';
import { SearchDeviceModelQueryDto } from '../dtos/search-device-model-query.dto';
import { DeviceModelFindAllDto } from '../dtos/find-all-device-model.dto';

@Injectable()
export class DeviceModelService {
  constructor(private database: DatabaseService) {}

  async create(dto: CreateDeviceModelDto): Promise<PublicDeviceModelDto> {
    const last = await this.database.deviceModel.findOne({
      where: { deletedAt: IsNull() },
      order: { index: 'desc' },
    });

    const index = last ? last.index + 1 : 1;

    const colors = await this.database.deviceColor.find({
      where: { id: optionalIn(dto.colors) },
    });
    if (!colors || colors.length !== dto.colors.length) {
      throw new BadRequestException('Invalid colors');
    }

    const storageSizes = await this.database.deviceStorageSize.find({
      where: { id: optionalIn(dto.storageSizes) },
    });
    if (!storageSizes || storageSizes.length !== dto.storageSizes.length) {
      throw new BadRequestException('Invalid storage sizes');
    }

    const created = await this.database.transaction(async (database) => {
      const model = await database.deviceModel.save(
        database.deviceModel.create({
          name: dto.name,
          index: index,
          active: true,
          availableColors: dto.colors.map((id) => ({ id })),
          availableStorageSizes: dto.storageSizes.map((id) => ({ id })),
          accessories: dto.recommendedAccesories.map((productId, index) => ({
            productId,
            index,
          })),
        }),
      );

      return model;
    });

    return this.parseToPublicDto(created);
  }

  async update(id: number, dto: UpdateDeviceModelDto) {
    const model = await this.database.deviceModel.findOne({
      where: { id, deletedAt: IsNull() },
    });
    if (!model) throw new BadRequestException('Model not found');

    const colors = await this.database.deviceColor.find({
      where: { id: optionalIn(dto.colors) },
    });
    if (!colors || colors.length !== dto.colors.length) {
      throw new BadRequestException('Invalid colors');
    }

    const storageSizes = await this.database.deviceStorageSize.find({
      where: { id: optionalIn(dto.storageSizes) },
    });
    if (!storageSizes || storageSizes.length !== dto.storageSizes.length) {
      throw new BadRequestException('Invalid storage sizes');
    }

    await updateEntity(
      this.database.deviceModel,
      { id },
      { name: dto.name ?? model.name, active: dto.active ?? model.active },
    );

    if (dto.colors) {
      await updateEntity(
        this.database.deviceModel,
        { id },
        { availableColors: dto.colors.map((id) => ({ id })) },
      );
    }

    if (dto.storageSizes) {
      await updateEntity(
        this.database.deviceModel,
        { id },
        { availableStorageSizes: dto.storageSizes.map((id) => ({ id })) },
      );
    }

    if (dto.recommendedAccesories) {
      await this.database.transaction(async (client) => {
        await client.modelAccesories.delete({ modelId: id });
        await client.modelAccesories.save(
          client.modelAccesories.create(
            dto.recommendedAccesories.map((productId, index) => ({
              productId,
              index,
              modelId: id,
            })),
          ),
        );
      });
    }

    return this.findOne(id);
  }

  async remove(id: number) {
    const model = await this.database.deviceModel.findOne({
      where: { id, deletedAt: IsNull() },
    });
    if (!model) throw new BadRequestException('Model not found');

    await updateEntity(
      this.database.deviceModel,
      { id },
      { deletedAt: new Date() },
    );

    return;
  }

  async findAll(data: DeviceModelFindAllDto) {
    const models = await this.database.deviceModel.find({
      where: { deletedAt: IsNull() },
      order: { index: 'desc' },
      relations: {
        availableColors: true,
        availableStorageSizes: true,
        ...(data.includePriceReferences && { priceReferences: true }),
      },
    });

    return models.map((model) => ({
      ...model,
      availableColors: model.availableColors.filter(
        (color) => color.active && !color.deletedAt,
      ),
      availableStorageSizes: model.availableStorageSizes
        .filter((size) => size.active && !size.deletedAt)
        .sort((a, b) => b.index - a.index),
    }));
  }

  async findOne(id: number) {
    const model = await this.database.deviceModel.findOne({
      where: { id, deletedAt: IsNull() },
      relations: {
        availableColors: true,
        availableStorageSizes: true,
        accessories: { product: true },
      },
    });

    if (!model) throw new BadRequestException('Model not found');

    model.availableColors = model.availableColors.filter(
      (color) => color.active && !color.deletedAt,
    );
    model.availableStorageSizes = model.availableStorageSizes
      .filter((size) => size.active && !size.deletedAt)
      .sort((a, b) => b.index - a.index);
    model['recommendedAccesories'] = model.accessories
      .sort((a, b) => a.index - b.index)
      .map((accessory) => accessory.product);
    delete model.accessories;
    return model;
  }

  async updateIndexes(data: { id: number; index: number }[]) {
    return await this.database.transaction((tx) =>
      Promise.all(
        data.map(({ id, index }) =>
          updateEntity(tx.deviceModel, { id }, { index }),
        ),
      ),
    );
  }

  private parseToPublicDto(data: DeviceModel): PublicDeviceModelDto {
    return {
      id: data.id,
      name: data.name,
      index: data.index,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      active: data.active,
    };
  }

  async search(query: SearchDeviceModelQueryDto) {
    const models = await this.database.deviceModel.find({
      where: {
        deletedAt: IsNull(),
        active: query.active,
        name: containsText(query.query),
      },
      order: { index: 'desc' },
      take: 20,
    });

    return models.map((model) => this.parseToPublicDto(model));
  }
}
