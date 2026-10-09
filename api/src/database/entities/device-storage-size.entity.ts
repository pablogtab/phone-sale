import { EntitySchema } from 'typeorm';
import { DeviceStorageSize } from './models';

export const DeviceStorageSizeEntity = new EntitySchema<DeviceStorageSize>({
  name: 'DeviceStorageSize',
  tableName: 'device_storage_sizes',
  columns: {
    id: {
      type: 'integer',
      nullable: false,
      primary: true,
      generated: true,
    },
    size: {
      type: 'text',
      nullable: false,
    },
    index: {
      type: 'integer',
      nullable: false,
    },
    active: {
      type: 'boolean',
      nullable: false,
      default: true,
    },
    createdAt: {
      type: 'timestamptz',
      nullable: false,
      createDate: true,
    },
    updatedAt: {
      type: 'timestamptz',
      nullable: false,
      updateDate: true,
    },
    deletedAt: {
      type: 'timestamptz',
      nullable: true,
    },
  },
  relations: {
    devices: {
      type: 'one-to-many',
      target: 'Device',
      inverseSide: 'storageSize',
      cascade: ['insert', 'update'],
    },
    deviceModels: {
      type: 'many-to-many',
      target: 'DeviceModel',
      inverseSide: 'availableStorageSizes',
    },
    priceReferences: {
      type: 'one-to-many',
      target: 'DevicePriceReference',
      inverseSide: 'storageSize',
      cascade: ['insert', 'update'],
    },
  },
});
