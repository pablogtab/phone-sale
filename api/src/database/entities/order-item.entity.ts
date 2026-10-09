import { EntitySchema } from 'typeorm';
import { OrderItem } from './models';

export const OrderItemEntity = new EntitySchema<OrderItem>({
  name: 'OrderItem',
  tableName: 'order_items',
  columns: {
    id: {
      type: 'integer',
      nullable: false,
      primary: true,
      generated: true,
    },
    exchangeRate: {
      type: 'double precision',
      nullable: false,
    },
    quantity: {
      type: 'integer',
      nullable: false,
    },
    priceUSD: {
      type: 'double precision',
      nullable: false,
    },
    priceARS: {
      type: 'double precision',
      nullable: false,
    },
    discount: {
      type: 'double precision',
      nullable: false,
    },
    total: {
      type: 'double precision',
      nullable: false,
    },
    isWholesale: {
      type: 'boolean',
      nullable: false,
    },
    orderId: {
      type: 'integer',
      nullable: false,
    },
    productId: {
      type: 'integer',
      nullable: false,
    },
    createdAt: {
      type: 'timestamptz',
      nullable: false,
      createDate: true,
    },
  },
  relations: {
    order: {
      type: 'many-to-one',
      target: 'Order',
      joinColumn: {
        name: 'orderId',
        referencedColumnName: 'id',
      },
      nullable: false,
      inverseSide: 'items',
    },
    product: {
      type: 'many-to-one',
      target: 'Product',
      joinColumn: {
        name: 'productId',
        referencedColumnName: 'id',
      },
      nullable: false,
      inverseSide: 'orderItems',
    },
  },
});
