import { Module, forwardRef } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { AccountingAccountsModule } from '../accounting-accounts/accounting-accounts.module';

@Module({
  imports: [forwardRef(() => AccountingAccountsModule)],
  exports: [UsersService],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
