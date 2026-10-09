import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common';

import { CreateDeviceStorageSizeDto } from '../dtos/create-device-storage-size.dto';
import { UpdateDeviceStorageSizeDto } from '../dtos/update-device-storage-size.dto';
import { DeviceStorageSizeService } from '../services/device-storage-size.service';
import { UpdateIndexesDto } from '../dtos/update-indexes.dto';

@Controller('devices/storage-size')
export class DeviceStorageSizeController {
  constructor(
    private readonly deviceStorageSizeService: DeviceStorageSizeService,
  ) {}

  @Post()
  create(@Body() createDeviceStorageSizeDto: CreateDeviceStorageSizeDto) {
    return this.deviceStorageSizeService.create(createDeviceStorageSizeDto);
  }

  @Get()
  findAll() {
    return this.deviceStorageSizeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.deviceStorageSizeService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDeviceStorageSizeDto: UpdateDeviceStorageSizeDto,
  ) {
    return this.deviceStorageSizeService.update(
      +id,
      updateDeviceStorageSizeDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.deviceStorageSizeService.remove(+id);
  }

  @Put('indexes')
  updateIndexes(@Body() body: UpdateIndexesDto) {
    return this.deviceStorageSizeService.updateIndexes(body.data);
  }
}
