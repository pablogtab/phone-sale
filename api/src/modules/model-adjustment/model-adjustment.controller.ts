import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateAdjustmentDto } from './dto/create-adjustment.dto';
import { ModelAdjustmentService } from './model-adjustment.service';
import { UpdateAdjustmentDto } from './dto/update-adjustment.dto';
import { DeviceModelWithAdjustments } from './dto/device-model-with-adjustments.dto';

@Controller('model-adjustment')
export class ModelAdjustmentController {
  constructor(private modelAdjustmentService: ModelAdjustmentService) {}

  @Post()
  async create(@Body() dto: CreateAdjustmentDto) {
    return await this.modelAdjustmentService.create(dto);
  }

  @Patch(':id')
  async update(
    @Body() dto: UpdateAdjustmentDto,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return await this.modelAdjustmentService.update(id, dto);
  }

  @Get()
  async getAllModelAdjustment(): Promise<DeviceModelWithAdjustments[]> {
    return await this.modelAdjustmentService.getAllModelAdjustment();
  }

  @Get(':id')
  async getById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<DeviceModelWithAdjustments[]> {
    return await this.modelAdjustmentService.getAllModelAdjustment(id);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return await this.modelAdjustmentService.delete(id);
  }
}
