import {
  updateEntity,
  removeEntity,
  optionalIn,
  containsText,
} from '@/database/repository-utils';
import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CreateAdjustmentDto } from './dto/create-adjustment.dto';
import { UpdateAdjustmentDto } from './dto/update-adjustment.dto';
import { DeviceModelWithAdjustments } from './dto/device-model-with-adjustments.dto';

@Injectable()
export class ModelAdjustmentService {
  constructor(private database: DatabaseService) {}

  async create(dto: CreateAdjustmentDto) {
    return this.database.modelAdjustment.save(
      this.database.modelAdjustment.create({
        modelId: dto.modelId,
        type: dto.type,
        rangeStart: dto.rangeStart,
        rangeEnd: dto.rangeEnd,
        factor: dto.factor,
        description: dto.description,
      }),
    );
  }

  async update(id: number, dto: UpdateAdjustmentDto) {
    return updateEntity(
      this.database.modelAdjustment,
      { id },
      {
        modelId: dto.modelId,
        type: dto.type,
        rangeStart: dto.rangeStart,
        rangeEnd: dto.rangeEnd,
        factor: dto.factor,
        description: dto.description,
      },
    );
  }

  async delete(id: number) {
    return removeEntity(this.database.modelAdjustment, { id });
  }

  async getAllModelAdjustment(
    id?: number,
  ): Promise<DeviceModelWithAdjustments[]> {
    const where = id ? { id: id } : {};
    const deviceModels = await this.database.deviceModel.find({
      where,
      relations: { ModelAdjustment: true },
    });

    return deviceModels.map((dm) => ({
      modelId: dm.id,
      modelName: dm.name,
      modelAdjustments: dm.ModelAdjustment.map((ma) => ({
        id: ma.id,
        modelId: dm.id,
        type: ma.type,
        rangeStart: ma.rangeStart,
        rangeEnd: ma.rangeEnd,
        factor: ma.factor,
        description: ma.description,
      })),
    }));
  }
}
