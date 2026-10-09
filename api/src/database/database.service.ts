import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { AsyncLocalStorage } from 'async_hooks';
import { DataSource, EntityManager, Repository } from 'typeorm';
import {
  AccountingAccount,
  AccountingTransaction,
  Bank,
  CashAccount,
  Client,
  DeviceHistory,
  DeviceModel,
  ModelAccesories,
  DeviceStorageSize,
  DeviceColor,
  DeviceFile,
  Device,
  DevicePriceReference,
  Event,
  ModelAdjustment,
  OrderPayment,
  OrderItem,
  Order,
  Parameter,
  Product,
  Provider,
  User,
  UserAuth,
} from './entities';

export class Repositories {
  constructor(private readonly baseManager: EntityManager) {}
  protected get manager(): EntityManager {
    return this.baseManager;
  }
  get accountingAccount(): Repository<AccountingAccount> {
    return this.manager.getRepository<AccountingAccount>('AccountingAccount');
  }
  get accountingTransaction(): Repository<AccountingTransaction> {
    return this.manager.getRepository<AccountingTransaction>(
      'AccountingTransaction',
    );
  }
  get bank(): Repository<Bank> {
    return this.manager.getRepository<Bank>('Bank');
  }
  get cashAccount(): Repository<CashAccount> {
    return this.manager.getRepository<CashAccount>('CashAccount');
  }
  get client(): Repository<Client> {
    return this.manager.getRepository<Client>('Client');
  }
  get deviceHistory(): Repository<DeviceHistory> {
    return this.manager.getRepository<DeviceHistory>('DeviceHistory');
  }
  get deviceModel(): Repository<DeviceModel> {
    return this.manager.getRepository<DeviceModel>('DeviceModel');
  }
  get modelAccesories(): Repository<ModelAccesories> {
    return this.manager.getRepository<ModelAccesories>('ModelAccesories');
  }
  get deviceStorageSize(): Repository<DeviceStorageSize> {
    return this.manager.getRepository<DeviceStorageSize>('DeviceStorageSize');
  }
  get deviceColor(): Repository<DeviceColor> {
    return this.manager.getRepository<DeviceColor>('DeviceColor');
  }
  get deviceFile(): Repository<DeviceFile> {
    return this.manager.getRepository<DeviceFile>('DeviceFile');
  }
  get device(): Repository<Device> {
    return this.manager.getRepository<Device>('Device');
  }
  get devicePriceReference(): Repository<DevicePriceReference> {
    return this.manager.getRepository<DevicePriceReference>(
      'DevicePriceReference',
    );
  }
  get event(): Repository<Event> {
    return this.manager.getRepository<Event>('Event');
  }
  get modelAdjustment(): Repository<ModelAdjustment> {
    return this.manager.getRepository<ModelAdjustment>('ModelAdjustment');
  }
  get orderPayment(): Repository<OrderPayment> {
    return this.manager.getRepository<OrderPayment>('OrderPayment');
  }
  get orderItem(): Repository<OrderItem> {
    return this.manager.getRepository<OrderItem>('OrderItem');
  }
  get order(): Repository<Order> {
    return this.manager.getRepository<Order>('Order');
  }
  get parameter(): Repository<Parameter> {
    return this.manager.getRepository<Parameter>('Parameter');
  }
  get product(): Repository<Product> {
    return this.manager.getRepository<Product>('Product');
  }
  get provider(): Repository<Provider> {
    return this.manager.getRepository<Provider>('Provider');
  }
  get user(): Repository<User> {
    return this.manager.getRepository<User>('User');
  }
  get userAuth(): Repository<UserAuth> {
    return this.manager.getRepository<UserAuth>('UserAuth');
  }
}

@Injectable()
export class DatabaseService extends Repositories {
  private readonly scope = new AsyncLocalStorage<EntityManager>();
  constructor(@InjectDataSource() private readonly source: DataSource) {
    super(source.manager);
  }
  protected override get manager(): EntityManager {
    return this.scope.getStore() ?? this.source.manager;
  }
  transaction<T>(work: (repositories: Repositories) => Promise<T>): Promise<T> {
    const active = this.scope.getStore();
    if (active) return work(new Repositories(active));
    return this.source.transaction((manager) =>
      this.scope.run(manager, () => work(new Repositories(manager))),
    );
  }
}
