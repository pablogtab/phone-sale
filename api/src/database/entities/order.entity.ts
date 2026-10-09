import { EntitySchema } from 'typeorm';
import { Order } from './models';

export const OrderEntity = new EntitySchema<Order>({
  name: 'Order',
  tableName: 'orders',
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
    status: {
      type: 'enum',
      nullable: false,
      enum: ['pending', 'confirmed', 'cancelled', 'deposited'],
      enumName: 'OrderStatus',
    },
    exchangeRate: {
      type: 'double precision',
      nullable: false,
    },
    type: {
      type: 'enum',
      nullable: false,
      enum: ['sale', 'faceid', 'wholesale'],
      enumName: 'OrderType',
    },
    deliveredByUserId: {
      type: 'integer',
      nullable: true,
    },
    userId: {
      type: 'integer',
      nullable: false,
    },
    eventId: {
      type: 'integer',
      nullable: false,
    },
    clientId: {
      type: 'integer',
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
  },
  relations: {
    deliveredByUser: {
      type: 'many-to-one',
      target: 'User',
      joinColumn: {
        name: 'deliveredByUserId',
        referencedColumnName: 'id',
      },
      nullable: true,
      inverseSide: 'deliveredOrders',
    },
    user: {
      type: 'many-to-one',
      target: 'User',
      joinColumn: {
        name: 'userId',
        referencedColumnName: 'id',
      },
      nullable: false,
      inverseSide: 'orders',
    },
    event: {
      type: 'many-to-one',
      target: 'Event',
      joinColumn: {
        name: 'eventId',
        referencedColumnName: 'id',
      },
      nullable: false,
      inverseSide: 'orders',
    },
    client: {
      type: 'many-to-one',
      target: 'Client',
      joinColumn: {
        name: 'clientId',
        referencedColumnName: 'id',
      },
      nullable: false,
      inverseSide: 'orders',
    },
    payments: {
      type: 'one-to-many',
      target: 'OrderPayment',
      inverseSide: 'order',
      cascade: ['insert', 'update'],
    },
    items: {
      type: 'one-to-many',
      target: 'OrderItem',
      inverseSide: 'order',
      cascade: ['insert', 'update'],
    },
  },
});
