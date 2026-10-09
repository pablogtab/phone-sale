import { EquipmentGradingEntity } from './equipment-grading.entity';
import { AccountingAccountEntity } from './accounting-account.entity';
import { AccountingTransactionEntity } from './accounting-transaction.entity';
import { BankEntity } from './bank.entity';
import { CashAccountEntity } from './cash-account.entity';
import { ClientEntity } from './client.entity';
import { DeviceHistoryEntity } from './device-history.entity';
import { DeviceModelEntity } from './device-model.entity';
import { ModelAccesoriesEntity } from './model-accesories.entity';
import { DeviceStorageSizeEntity } from './device-storage-size.entity';
import { DeviceColorEntity } from './device-color.entity';
import { DeviceFileEntity } from './device-file.entity';
import { DeviceEntity } from './device.entity';
import { DevicePriceReferenceEntity } from './device-price-reference.entity';
import { EventEntity } from './event.entity';
import { ModelAdjustmentEntity } from './model-adjustment.entity';
import { OrderPaymentEntity } from './order-payment.entity';
import { OrderItemEntity } from './order-item.entity';
import { OrderEntity } from './order.entity';
import { ParameterEntity } from './parameter.entity';
import { ProductEntity } from './product.entity';
import { ProviderEntity } from './provider.entity';
import { UserEntity } from './user.entity';
import { UserAuthEntity } from './user-auth.entity';
export * from './models';

export const entities = [
  EquipmentGradingEntity,
  AccountingAccountEntity,
  AccountingTransactionEntity,
  BankEntity,
  CashAccountEntity,
  ClientEntity,
  DeviceHistoryEntity,
  DeviceModelEntity,
  ModelAccesoriesEntity,
  DeviceStorageSizeEntity,
  DeviceColorEntity,
  DeviceFileEntity,
  DeviceEntity,
  DevicePriceReferenceEntity,
  EventEntity,
  ModelAdjustmentEntity,
  OrderPaymentEntity,
  OrderItemEntity,
  OrderEntity,
  ParameterEntity,
  ProductEntity,
  ProviderEntity,
  UserEntity,
  UserAuthEntity,
];
