import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  NotFoundException,
} from '@nestjs/common';

import { UpdateParameterDto } from './dto/update-parameter.dto';
import { ParametersService } from './parameters.service';
import { ParameterKey, PARAMETERS_KEYS } from '@/common/parameters';

@Controller('parameters')
export class ParametersController {
  constructor(private readonly parametersService: ParametersService) {}

  @Get(':id')
  findOne(@Param('id') id: string) {
    if (!Object.prototype.hasOwnProperty.call(PARAMETERS_KEYS, id))
      throw new NotFoundException('Parameter not found');
    return this.parametersService.findOne(id as ParameterKey);
  }

  @Patch(':id')
  update(
    @Param('id') key: string,
    @Body() updateParameterDto: UpdateParameterDto,
  ) {
    if (!Object.prototype.hasOwnProperty.call(PARAMETERS_KEYS, key))
      throw new NotFoundException('Parameter not found');
    return this.parametersService.update(key, updateParameterDto);
  }
}
