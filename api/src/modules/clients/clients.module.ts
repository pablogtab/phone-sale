import { Module } from '@nestjs/common';

import { AccountingAccountsModule } from '../accounting-accounts/accounting-accounts.module';
import { ClientsController } from './clients.controller';
import { ClientsService } from './clients.service';

@Module({
  imports: [AccountingAccountsModule],
  exports: [ClientsService],
  controllers: [ClientsController],
  providers: [ClientsService],
})
export class ClientsModule {}
