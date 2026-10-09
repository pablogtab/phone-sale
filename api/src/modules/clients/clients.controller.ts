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
} from '@nestjs/common';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { HasPermission } from '@/common/decorators/has-permission.decorator';
import { PaginationDto } from '@/common/dtos/pagination.dto';
import { SearchClientDto } from './dto/search-client.dto';

@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  @HasPermission({ module: 'clients', actions: 'admin_write' })
  create(@Body() dto: CreateClientDto) {
    return this.clientsService.create(dto);
  }

  @Get('search')
  search(@Query() pag: SearchClientDto) {
    return this.clientsService.search(pag);
  }

  @Get()
  @HasPermission({ module: 'clients', actions: 'admin_read' })
  findAll(@Query() pag: PaginationDto) {
    return this.clientsService.findAll(pag);
  }

  @Get(':uuid')
  @HasPermission({ module: 'clients', actions: 'read' })
  findOne(@Param('uuid', new ParseUUIDPipe()) uuid: string) {
    return this.clientsService.findOne(uuid);
  }

  @Patch(':uuid')
  @HasPermission({ module: 'clients', actions: 'admin_write' })
  update(
    @Param('uuid', new ParseUUIDPipe()) uuid: string,
    @Body() dto: UpdateClientDto,
  ) {
    return this.clientsService.update(uuid, dto);
  }

  @Delete(':uuid')
  @HasPermission({ module: 'clients', actions: 'admin_write' })
  remove(@Param('uuid', new ParseUUIDPipe()) uuid: string) {
    return this.clientsService.remove(uuid);
  }
}
