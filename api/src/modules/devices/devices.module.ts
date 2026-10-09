import { Module } from '@nestjs/common';
import { ProvidersModule } from '../providers/providers.module';

import { DeviceColorController } from './controllers/device-color.controller';
import { DeviceModelController } from './controllers/device-model.controller';
import { DevicePriceReferenceController } from './controllers/device-price-reference.controller';
import { DeviceStorageSizeController } from './controllers/device-storage-size.controller';
import { DeviceController } from './controllers/device.controller';
import { DeviceColorService } from './services/device-color.service';
import { DeviceFileService } from './services/device-file.service';
import { DeviceModelService } from './services/device-model.service';
import { DevicePriceReferenceService } from './services/device-price-reference.service';
import { DeviceStorageSizeService } from './services/device-storage-size.service';
import { DeviceService } from './services/device.service';
import { DeviceHistoryService } from './services/device-history.service';
import { AccountingAccountsModule } from '../accounting-accounts/accounting-accounts.module';

@Module({
  exports: [DeviceService, DevicePriceReferenceService],
  controllers: [
    DeviceController,
    DeviceModelController,
    DeviceColorController,
    DeviceStorageSizeController,
    DevicePriceReferenceController,
  ],
  providers: [
    DeviceService,
    DeviceFileService,
    DeviceColorService,
    DeviceModelService,
    DeviceStorageSizeService,
    DevicePriceReferenceService,
    DeviceHistoryService,
  ],
  imports: [AccountingAccountsModule, ProvidersModule],
})
export class DevicesModule {}
