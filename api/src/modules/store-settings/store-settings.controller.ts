import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Patch,
} from '@nestjs/common';
import { Transform } from 'class-transformer';
import { IsString, MaxLength, MinLength } from 'class-validator';
import { IsPublic } from '../../common/decorators/is-public.decorator';
import { User } from '../../common/decorators/user.decorator';
import { UserToken } from '../../auth/dto/token-info.dto';
import { StoreSettingsService } from './store-settings.service';

export class UpdateStoreSettingsDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(2)
  @MaxLength(60)
  name: string;
}

@Controller('store-settings')
export class StoreSettingsController {
  constructor(private readonly settings: StoreSettingsService) {}
  @IsPublic()
  @Get()
  get() {
    return this.settings.get();
  }

  @Patch()
  update(@Body() dto: UpdateStoreSettingsDto, @User() user: UserToken) {
    if (user.role !== 'admin')
      throw new ForbiddenException(
        'Solo el administrador puede configurar la tienda',
      );
    return this.settings.update(dto.name);
  }
}
