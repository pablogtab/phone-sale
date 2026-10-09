import { PartialType } from '@nestjs/mapped-types';

import { CreateDeviceServiceDto } from './create-device-service.dto';

export class UpdateDeviceServiceDto extends PartialType(
  CreateDeviceServiceDto,
) {}
