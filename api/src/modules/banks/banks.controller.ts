import { HasPermission } from '@/common/decorators/has-permission.decorator';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import { BanksService } from './banks.service';
import { CreateBankDto } from './dto/create-bank.dto';
import { UpdateBankDto } from './dto/update-bank.dto';
import { SearchBankQueryDto } from './dto/search-bank-query.dto';

@Controller('banks')
export class BanksController {
  constructor(private readonly banksService: BanksService) {}

  @Post()
  @HasPermission({ module: 'banks', actions: 'admin_write' })
  create(@Body() createBankDto: CreateBankDto) {
    return this.banksService.create(createBankDto);
  }

  @Get()
  @HasPermission({ module: 'banks', actions: 'admin_read' })
  findAll() {
    return this.banksService.findAll();
  }

  @Get('search')
  search(@Query() query: SearchBankQueryDto) {
    return this.banksService.search(query);
  }

  @Get(':id')
  @HasPermission({ module: 'banks', actions: 'read' })
  findOne(@Param('id', new ParseIntPipe()) id: number) {
    return this.banksService.findOne(id);
  }

  @Patch(':uuid')
  @HasPermission({ module: 'banks', actions: 'admin_write' })
  update(
    @Param('uuid', new ParseUUIDPipe()) uuid: string,
    @Body() updateBankDto: UpdateBankDto,
  ) {
    return this.banksService.update(uuid, updateBankDto);
  }

  @Delete(':uuid')
  @HasPermission({ module: 'banks', actions: 'admin_write' })
  remove(@Param('uuid', new ParseUUIDPipe()) uuid: string) {
    return this.banksService.remove(uuid);
  }
}
