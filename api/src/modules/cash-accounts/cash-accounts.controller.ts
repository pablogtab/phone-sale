import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { CashAccountsService } from './cash-accounts.service';
import { CreateCashAccountDto } from './dto/create-cash-account.dto';
import { UpdateCashAccountDto } from './dto/update-cash-account.dto';
import { HasPermission } from '@/common/decorators/has-permission.decorator';
import { SearchCashAccountQueryDto } from './dto/search-cash-account-query.dto';

@Controller('cash-accounts')
export class CashAccountsController {
  constructor(private readonly cashAccountsService: CashAccountsService) {}

  @Post()
  @HasPermission({ module: 'cash_accounts', actions: 'admin_write' })
  create(@Body() dto: CreateCashAccountDto) {
    return this.cashAccountsService.create(dto);
  }

  @Get()
  @HasPermission({ module: 'cash_accounts', actions: 'admin_read' })
  findAll() {
    return this.cashAccountsService.findAll();
  }

  @Get('search')
  search(@Query() query: SearchCashAccountQueryDto) {
    return this.cashAccountsService.search(query);
  }

  @Get(':id')
  @HasPermission({ module: 'cash_accounts', actions: 'read' })
  findOne(@Param('id', new ParseIntPipe()) id: number) {
    return this.cashAccountsService.findOne(id);
  }

  @Patch(':uuid')
  @HasPermission({ module: 'cash_accounts', actions: 'admin_write' })
  update(
    @Param('uuid', new ParseUUIDPipe()) uuid: string,
    @Body() dto: UpdateCashAccountDto,
  ) {
    return this.cashAccountsService.update(uuid, dto);
  }

  @Delete(':uuid')
  @HasPermission({ module: 'cash_accounts', actions: 'admin_write' })
  remove(@Param('uuid', new ParseUUIDPipe()) uuid: string) {
    return this.cashAccountsService.remove(uuid);
  }
}
