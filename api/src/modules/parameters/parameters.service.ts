import { updateEntity } from '@/database/repository-utils';
import { ParameterKey, PARAMETERS_KEYS } from '@/common/parameters';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { DatabaseService } from '../../database/database.service';
import { UpdateParameterDto } from './dto/update-parameter.dto';

@Injectable()
export class ParametersService {
  constructor(private database: DatabaseService) {}

  async findOne(key: ParameterKey) {
    const parameter = await this.database.parameter.findOne({ where: { key } });

    if (!parameter) {
      throw new NotFoundException(`Parameter with key ${key} not found`);
    }

    return parameter;
  }

  async update(key: string, dto: UpdateParameterDto) {
    if (
      key === PARAMETERS_KEYS.dolar_hoy_cba_price &&
      (typeof dto.valueN !== 'number' ||
        !Number.isFinite(dto.valueN) ||
        dto.valueN <= 0 ||
        dto.valueN > 100000000)
    ) {
      throw new BadRequestException('Ingresá una cotización mayor a cero');
    }

    const parameter = await this.database.parameter.findOne({ where: { key } });

    if (!parameter) {
      throw new NotFoundException(`Parameter with key ${key} not found`);
    }

    return updateEntity(this.database.parameter, { key }, dto);
  }
}
