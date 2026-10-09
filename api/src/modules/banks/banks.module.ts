import { Module } from '@nestjs/common';
import { BanksService } from './banks.service';
import { BanksController } from './banks.controller';
import { AccountingAccountsModule } from '../accounting-accounts/accounting-accounts.module';

@Module({
  imports: [AccountingAccountsModule],
  controllers: [BanksController],
  providers: [BanksService],
})
export class BanksModule {}
