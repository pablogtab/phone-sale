import { Module } from '@nestjs/common';

import { AccountingAccountsModule } from '../accounting-accounts/accounting-accounts.module';
import { ProvidersController } from './providers.controller';
import { ProvidersService } from './providers.service';

@Module({
  imports: [AccountingAccountsModule],
  exports: [ProvidersService],
  controllers: [ProvidersController],
  providers: [ProvidersService],
})
export class ProvidersModule {}
