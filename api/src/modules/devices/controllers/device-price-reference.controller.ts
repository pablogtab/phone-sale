import { Body, Controller, Get, Post } from '@nestjs/common';
import { DevicePriceReferenceService } from '../services/device-price-reference.service';
import { UpsertDevicePriceReferenceDto } from '../dtos/upsert-device-price-reference.dto';
import { FindDevicePriceReferenceDto } from '../dtos/find-device-price-reference.dto';

@Controller('devices/price-reference')
export class DevicePriceReferenceController {
  constructor(
    private readonly devicePriceRefService: DevicePriceReferenceService,
  ) {}

  @Post('find')
  findPriceReference(@Body() data: FindDevicePriceReferenceDto) {
    return this.devicePriceRefService.findPriceReference(
      data.modelId,
      data.storageSizeId,
      data.isUsed,
    );
  }

  @Post()
  upsert(@Body() data: UpsertDevicePriceReferenceDto) {
    return this.devicePriceRefService.upsert(data);
  }
}
