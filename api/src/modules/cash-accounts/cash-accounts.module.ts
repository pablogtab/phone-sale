import { Module } from '@nestjs/common';

import { AccountingAccountsModule } from '../accounting-accounts/accounting-accounts.module';
import { CashAccountsController } from './cash-accounts.controller';
import { CashAccountsService } from './cash-accounts.service';

@Module({
  imports: [AccountingAccountsModule],
  controllers: [CashAccountsController],
  providers: [CashAccountsService],
})
export class CashAccountsModule {}
