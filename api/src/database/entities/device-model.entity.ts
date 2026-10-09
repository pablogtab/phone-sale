import { EntitySchema } from 'typeorm';
import { DeviceModel } from './models';

export const DeviceModelEntity = new EntitySchema<DeviceModel>({
  name: 'DeviceModel',
  tableName: 'device_models',
  columns: {
    id: {
      type: 'integer',
      nullable: false,
      primary: true,
      generated: true,
    },
    name: {
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
      inverseSide: 'model',
      cascade: ['insert', 'update'],
    },
    availableStorageSizes: {
      type: 'many-to-many',
      target: 'DeviceStorageSize',
      inverseSide: 'deviceModels',
      joinTable: {
        name: 'device_model_storage_sizes',
        joinColumn: {
          name: 'modelId',
          referencedColumnName: 'id',
        },
        inverseJoinColumn: {
          name: 'storageSizeId',
          referencedColumnName: 'id',
        },
      },
    },
    availableColors: {
      type: 'many-to-many',
      target: 'DeviceColor',
      inverseSide: 'deviceModels',
      joinTable: {
        name: 'device_model_colors',
        joinColumn: {
          name: 'modelId',
          referencedColumnName: 'id',
        },
        inverseJoinColumn: {
          name: 'colorId',
          referencedColumnName: 'id',
        },
      },
    },
    exampleFiles: {
      type: 'one-to-many',
      target: 'DeviceFile',
      inverseSide: 'deviceModel',
      cascade: ['insert', 'update'],
    },
    priceReferences: {
      type: 'one-to-many',
      target: 'DevicePriceReference',
      inverseSide: 'model',
      cascade: ['insert', 'update'],
    },
    ModelAdjustment: {
      type: 'one-to-many',
      target: 'ModelAdjustment',
      inverseSide: 'model',
      cascade: ['insert', 'update'],
    },
    accessories: {
      type: 'one-to-many',
      target: 'ModelAccesories',
      inverseSide: 'model',
      cascade: ['insert', 'update'],
    },
  },
});
