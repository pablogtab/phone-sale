import { EntitySchema } from 'typeorm';
import { Product } from './models';

export const ProductEntity = new EntitySchema<Product>({
  name: 'Product',
  tableName: 'products',
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
      generated: 'uuid',
    },
    code: {
      type: 'text',
      nullable: false,
    },
    description: {
      type: 'text',
      nullable: false,
    },
    unique: {
      type: 'boolean',
      nullable: false,
    },
    stock: {
      type: 'integer',
      nullable: false,
      default: 0,
    },
    sellingPrice: {
      type: 'double precision',
      nullable: false,
      default: 0,
    },
    costPrice: {
      type: 'double precision',
      nullable: false,
      default: 0,
    },
    deviceId: {
      type: 'integer',
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
  },
  relations: {
    device: {
      type: 'many-to-one',
      target: 'Device',
      joinColumn: {
        name: 'deviceId',
        referencedColumnName: 'id',
      },
      nullable: true,
      inverseSide: 'products',
    },
    orderItems: {
      type: 'one-to-many',
      target: 'OrderItem',
      inverseSide: 'product',
      cascade: ['insert', 'update'],
    },
    modelAccesories: {
      type: 'one-to-many',
      target: 'ModelAccesories',
      inverseSide: 'product',
      cascade: ['insert', 'update'],
    },
  },
});
