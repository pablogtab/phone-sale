import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';

import { CreateDeviceModelDto } from '../dtos/create-device-model.dto';
import { UpdateDeviceModelDto } from '../dtos/update-device-model.dto';
import { DeviceModelService } from '../services/device-model.service';
import { UpdateIndexesDto } from '../dtos/update-indexes.dto';
import { SearchDeviceModelQueryDto } from '../dtos/search-device-model-query.dto';
import { DeviceModelFindAllDto } from '../dtos/find-all-device-model.dto';

@Controller('devices/models')
export class DeviceModelController {
  constructor(private readonly deviceModelService: DeviceModelService) {}

  @Post()
  create(@Body() createDeviceDto: CreateDeviceModelDto) {
    return this.deviceModelService.create(createDeviceDto);
  }

  @Get()
  findAll(@Query() dto: DeviceModelFindAllDto) {
    return this.deviceModelService.findAll(dto);
  }

  @Get('search')
  search(@Query() query: SearchDeviceModelQueryDto) {
    return this.deviceModelService.search(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.deviceModelService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDeviceDto: UpdateDeviceModelDto,
  ) {
    return this.deviceModelService.update(+id, updateDeviceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.deviceModelService.remove(+id);
  }

  @Put('indexes')
  updateIndexes(@Body() data: UpdateIndexesDto) {
    return this.deviceModelService.updateIndexes(data.data);
  }
}
