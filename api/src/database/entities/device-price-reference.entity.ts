import { EntitySchema } from 'typeorm';
import { DevicePriceReference } from './models';

export const DevicePriceReferenceEntity =
  new EntitySchema<DevicePriceReference>({
    name: 'DevicePriceReference',
    tableName: 'device_price_references',
    columns: {
      id: {
        type: 'integer',
        nullable: false,
        primary: true,
        generated: true,
      },
      modelId: {
        type: 'integer',
        nullable: false,
      },
      storageSizeId: {
        type: 'integer',
        nullable: false,
      },
      purchasePrice: {
        type: 'double precision',
        nullable: false,
      },
      sellingPrice: {
        type: 'double precision',
        nullable: false,
      },
      sellingPriceSale: {
        type: 'double precision',
        nullable: false,
      },
      sellingPriceWholesale: {
        type: 'double precision',
        nullable: false,
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
      isUsed: {
        type: 'boolean',
        nullable: false,
        default: false,
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
        inverseSide: 'priceReferences',
      },
      storageSize: {
        type: 'many-to-one',
        target: 'DeviceStorageSize',
        joinColumn: {
          name: 'storageSizeId',
          referencedColumnName: 'id',
        },
        nullable: false,
        inverseSide: 'priceReferences',
      },
    },
  });
