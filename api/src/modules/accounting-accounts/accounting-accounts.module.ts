import { Module, forwardRef } from '@nestjs/common';

import { EventsModule } from '../events/events.module';
import { AccountingAccountTransactionsService } from './accounting-accounts-transactions.service';
import { AccountingAccountsController } from './accounting-accounts.controller';
import { AccountingAccountsService } from './accounting-accounts.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [EventsModule, forwardRef(() => UsersModule)],
  exports: [AccountingAccountsService, AccountingAccountTransactionsService],
  controllers: [AccountingAccountsController],
  providers: [AccountingAccountsService, AccountingAccountTransactionsService],
})
export class AccountingAccountsModule {}
