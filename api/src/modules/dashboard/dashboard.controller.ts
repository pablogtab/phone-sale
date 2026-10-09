import { Controller, ForbiddenException, Get, Query } from '@nestjs/common';
import { Type } from 'class-transformer';
import { IsIn, IsInt } from 'class-validator';
import { User } from '../../common/decorators/user.decorator';
import { UserToken } from '../../auth/dto/token-info.dto';
import { DashboardService } from './dashboard.service';

export class DashboardQuery {
  @Type(() => Number)
  @IsInt()
  @IsIn([7, 30, 90])
  days = 30;
}

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboard: DashboardService) {}

  @Get()
  get(@Query() query: DashboardQuery, @User() user: UserToken) {
    if (user.role !== 'admin') throw new ForbiddenException('El resumen financiero está disponible para administradores');
    return this.dashboard.get(query.days);
  }
}
