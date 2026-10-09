import { Module } from '@nestjs/common';

import { AccountingAccountsModule } from '../accounting-accounts/accounting-accounts.module';
import { EventsModule } from '../events/events.module';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { DevicesModule } from '../devices/devices.module';
import { ParametersModule } from '../parameters/parameters.module';

@Module({
  imports: [
    EventsModule,
    AccountingAccountsModule,
    DevicesModule,
    ParametersModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
