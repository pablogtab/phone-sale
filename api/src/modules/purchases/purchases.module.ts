import { Module } from '@nestjs/common';

import { AccountingAccountsModule } from '../accounting-accounts/accounting-accounts.module';
import { DevicesModule } from '../devices/devices.module';
import { PurchasesController } from './purchases.controller';
import { PurchasesService } from './purchases.service';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [EventsModule, DevicesModule, AccountingAccountsModule],
  controllers: [PurchasesController],
  providers: [PurchasesService],
})
export class PurchasesModule {}
