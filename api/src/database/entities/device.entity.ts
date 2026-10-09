import { EntitySchema } from 'typeorm';
import { Device } from './models';

export const DeviceEntity = new EntitySchema<Device>({
  name: 'Device',
  tableName: 'devices',
  columns: {
    id: {
      type: 'integer',
      nullable: false,
      primary: true,
      generated: true,
    },
    publicId: {
      type: 'uuid',
      nullable: false,
      unique: true,
      generated: 'uuid',
    },
    description: {
      type: 'text',
      nullable: false,
    },
    internalComments: {
      type: 'text',
      nullable: true,
    },
    publicComments: {
      type: 'text',
      nullable: true,
    },
    status: {
      type: 'enum',
      nullable: false,
      enum: [
        'available',
        'reserved',
        'sold',
        'repairing',
        'damaged',
        'lost',
        'transit',
      ],
      enumName: 'DeviceStatus',
    },
    condition: {
      type: 'enum',
      nullable: false,
      enum: ['sealed', 'openBox', 'used'],
      enumName: 'DeviceCondition',
    },
    purchasePrice: {
      type: 'double precision',
      nullable: true,
    },
    depreciation: {
      type: 'double precision',
      nullable: true,
    },
    sellingPrice: {
      type: 'double precision',
      nullable: true,
    },
    batteryCicleCount: {
      type: 'integer',
      nullable: true,
    },
    batteryHealth: {
      type: 'integer',
      nullable: true,
    },
    imei: {
      type: 'text',
      nullable: true,
    },
    imei2: {
      type: 'text',
      nullable: true,
    },
    hasProblem: {
      type: 'boolean',
      nullable: false,
    },
    oficialWarranty: {
      type: 'boolean',
      nullable: false,
    },
    warrantyExpiresAt: {
      type: 'text',
      nullable: true,
    },
    modelId: {
      type: 'integer',
      nullable: false,
    },
    storageSizeId: {
      type: 'integer',
      nullable: false,
    },
    colorId: {
      type: 'integer',
      nullable: false,
    },
    originProviderId: {
      type: 'integer',
      nullable: true,
    },
    soldToClientId: {
      type: 'integer',
      nullable: true,
    },
    testedByUserId: {
      type: 'integer',
      nullable: true,
    },
    testedAt: {
      type: 'timestamptz',
      nullable: true,
    },
    testingComments: {
      type: 'text',
      nullable: true,
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
    technicalServiceProviderId: {
      type: 'integer',
      nullable: true,
    },
    technicalServiceDate: {
      type: 'timestamptz',
      nullable: true,
    },
    technicalServiceDescription: {
      type: 'text',
      nullable: true,
    },
    technicalServiceHistory: {
      type: 'text',
      nullable: true,
    },
  },
  relations: {
    model: {
      type: 'many-to-one',
      target: 'DeviceModel',
      joinColumn: {
        name: 'modelId',
        referencedColumnName: 'id',
      },
      nullable: false,
      inverseSide: 'devices',
    },
    storageSize: {
      type: 'many-to-one',
      target: 'DeviceStorageSize',
      joinColumn: {
        name: 'storageSizeId',
        referencedColumnName: 'id',
      },
      nullable: false,
      inverseSide: 'devices',
    },
    color: {
      type: 'many-to-one',
      target: 'DeviceColor',
      joinColumn: {
        name: 'colorId',
        referencedColumnName: 'id',
      },
      nullable: false,
      inverseSide: 'devices',
    },
    originProvider: {
      type: 'many-to-one',
      target: 'Provider',
      joinColumn: {
        name: 'originProviderId',
        referencedColumnName: 'id',
      },
      nullable: true,
      inverseSide: 'devices',
    },
    soldToClient: {
      type: 'many-to-one',
      target: 'Client',
      joinColumn: {
        name: 'soldToClientId',
        referencedColumnName: 'id',
      },
      nullable: true,
      inverseSide: 'boughtDevices',
    },
    testedByUser: {
      type: 'many-to-one',
      target: 'User',
      joinColumn: {
        name: 'testedByUserId',
        referencedColumnName: 'id',
      },
      nullable: true,
      inverseSide: 'testedDevices',
    },
    files: {
      type: 'one-to-many',
      target: 'DeviceFile',
      inverseSide: 'device',
      cascade: ['insert', 'update'],
    },
    products: {
      type: 'one-to-many',
      target: 'Product',
      inverseSide: 'device',
      cascade: ['insert', 'update'],
    },
    orderPayments: {
      type: 'one-to-many',
      target: 'OrderPayment',
      inverseSide: 'device',
      cascade: ['insert', 'update'],
    },
    deviceHistory: {
      type: 'one-to-many',
      target: 'DeviceHistory',
      inverseSide: 'device',
      cascade: ['insert', 'update'],
    },
    technicalServiceProvider: {
      type: 'many-to-one',
      target: 'Provider',
      joinColumn: {
        name: 'technicalServiceProviderId',
        referencedColumnName: 'id',
      },
      nullable: true,
      inverseSide: 'technicalServiceDevices',
    },
  },
});
