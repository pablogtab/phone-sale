import { AuthModule } from '@/auth/auth.module';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { StoreSettingsModule } from './modules/store-settings/store-settings.module';

import { LoggerMiddleware } from './common/middlewares/logger.middleware';
import { AccountingAccountsModule } from './modules/accounting-accounts/accounting-accounts.module';
import { BanksModule } from './modules/banks/banks.module';
import { CashAccountsModule } from './modules/cash-accounts/cash-accounts.module';
import { ClientsModule } from './modules/clients/clients.module';
import { DevicesModule } from './modules/devices/devices.module';
import { ModelAdjustmentModule } from './modules/model-adjustment/model-adjustment.module';
import { OrdersModule } from './modules/orders/orders.module';
import { ParametersModule } from './modules/parameters/parameters.module';
import { ProductsModule } from './modules/products/products.module';
import { ProvidersModule } from './modules/providers/providers.module';
import { PublicModule } from './modules/public/public.module';
import { PurchasesModule } from './modules/purchases/purchases.module';
import { DatabaseModule } from './database/database.module';
import { FilesModule } from './common/files/files.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    StoreSettingsModule,
    EventEmitterModule.forRoot(),
    AuthModule,
    UsersModule,
    BanksModule,
    ProvidersModule,
    ParametersModule,
    CashAccountsModule,
    AccountingAccountsModule,
    ClientsModule,
    PublicModule,
    DatabaseModule,
    FilesModule,
    DevicesModule,
    ProductsModule,
    OrdersModule,
    ModelAdjustmentModule,
    PurchasesModule,
  ],
  controllers: [],
  providers: [LoggerMiddleware],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
