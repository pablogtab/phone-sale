import { User } from '@/common/decorators/user.decorator';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import { UserToken } from '../../auth/dto/token-info.dto';
import { AccountingAccountTransactionsService } from './accounting-accounts-transactions.service';
import { AccountingAccountsService } from './accounting-accounts.service';
import { GetAccountingAccountsQuery } from './dto/get-accounting-accounts-query.dto';
import { SimpleTransactionDto } from './dto/simple-transaction.dto';
import { TransferTransactionDto } from './dto/transfer-transaction.dto';
import { UpdateAccountingAccountDto } from './dto/update-accounting-account.dto';
import { GetAccountingTransactionsQuery } from './dto/get-accounting-transactions-query.dto';

@Controller('accounting')
export class AccountingAccountsController {
  constructor(
    private readonly accountingAccountsService: AccountingAccountsService,
    private readonly transactionService: AccountingAccountTransactionsService,
  ) {}

  @Post('simple-transaction')
  createSimpleTransaction(
    @Body() data: SimpleTransactionDto,
    @User() userToken: UserToken,
  ) {
    return this.transactionService.simpleTransaction(data, userToken.userId);
  }

  @Post('transfer')
  createTransferTransaction(
    @Body() data: TransferTransactionDto,
    @User() userToken: UserToken,
  ) {
    return this.transactionService.transferTransaction(data, userToken.userId);
  }

  @Get('accounts')
  findAll(@Query() query: GetAccountingAccountsQuery) {
    return this.accountingAccountsService.findAll(query);
  }

  @Get('transactions')
  findTransactions(@Query() query: GetAccountingTransactionsQuery) {
    return this.accountingAccountsService.findTransactions(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return id;
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAccountingAccountDto: UpdateAccountingAccountDto,
  ) {
    return '';
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return '';
  }
}
