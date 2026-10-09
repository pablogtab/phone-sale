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

import { CreateDeviceColorDto } from '../dtos/create-device-color.dto';
import { UpdateDeviceColorDto } from '../dtos/update-device-color.dto';
import { DeviceColorService } from '../services/device-color.service';
import { UpdateIndexesDto } from '../dtos/update-indexes.dto';

@Controller('devices/color')
export class DeviceColorController {
  constructor(private readonly deviceColorService: DeviceColorService) {}

  @Post('')
  create(@Body() dto: CreateDeviceColorDto) {
    return this.deviceColorService.create(dto);
  }

  @Get('')
  findAll() {
    return this.deviceColorService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.deviceColorService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateDeviceColorDto) {
    return this.deviceColorService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.deviceColorService.remove(+id);
  }

  @Put('indexes')
  updateIndexes(@Body() body: UpdateIndexesDto) {
    //return this.deviceStorageSizeService.updateIndexes(body.data);
  }
}
