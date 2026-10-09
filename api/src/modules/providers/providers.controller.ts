import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ProvidersService } from './providers.service';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { HasPermission } from '@/common/decorators/has-permission.decorator';
import { SearchProviderQueryDto } from './dto/search-provider-query.dto';

@Controller('providers')
export class ProvidersController {
  constructor(private readonly providersService: ProvidersService) {}

  @Post()
  @HasPermission({ module: 'providers', actions: 'admin_write' })
  create(@Body() dto: CreateProviderDto) {
    return this.providersService.create(dto);
  }

  @Get('search')
  // @HasPermission({ module: 'providers', actions: 'admin_read' })
  search(@Query() query: SearchProviderQueryDto) {
    return this.providersService.search(query);
  }

  @Get()
  @HasPermission({ module: 'providers', actions: 'admin_read' })
  findAll() {
    return this.providersService.findAll();
  }

  @Get('id/:id')
  @HasPermission({ module: 'providers', actions: 'read' })
  findOneById(@Param('id', ParseIntPipe) id: number) {
    return this.providersService.findOneById(id);
  }

  @Get(':uuid')
  @HasPermission({ module: 'providers', actions: 'read' })
  findOne(@Param('uuid', new ParseUUIDPipe()) uuid: string) {
    return this.providersService.findOne(uuid);
  }

  @Patch(':uuid')
  @HasPermission({ module: 'providers', actions: 'admin_write' })
  update(
    @Param('uuid', new ParseUUIDPipe()) uuid: string,
    @Body() dto: UpdateProviderDto,
  ) {
    return this.providersService.update(uuid, dto);
  }

  @Delete(':uuid')
  @HasPermission({ module: 'providers', actions: 'admin_write' })
  remove(@Param('uuid', new ParseUUIDPipe()) uuid: string) {
    return this.providersService.remove(uuid);
  }
}
